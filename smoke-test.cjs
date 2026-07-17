const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

(async () => {
  const browserPath = findBrowserPath();
  const errors = [];
  const browser = await chromium.launch({
    headless: true,
    executablePath: browserPath
  });
  const page = await browser.newPage();

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  page.setDefaultTimeout(7000);
  await page.goto(pathToFileURL(path.join(__dirname, "index.html")).href);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const blankSaved = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length;
  });
  const storageNote = (await page.locator(".storage-note").innerText()).toLowerCase();
  if (
    !storageNote.includes("только в этом браузере") ||
    !storageNote.includes("не отправляются на сервер") ||
    !storageNote.includes("сохранить pdf")
  ) {
    throw new Error(`Storage note is incomplete: ${storageNote}`);
  }

  await page.locator("#titleInput").fill("Smoke entry");
  await page.locator("textarea[data-path='fields.situation']").first().fill("Stress situation");
  await page.locator("button[data-chip-path='fields.coreFeeling']").first().click();

  await page.waitForFunction(() => {
    return document.querySelector(".entry-card.active .entry-title")?.textContent === "Smoke entry";
  });

  const title = await page.locator(".entry-card.active .entry-title").textContent();
  const savedAfterFill = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length;
  });
  await page.locator("#newDiagnosticButton").click();
  const diagnosticIntensityCount = await page.locator("input[type='range'][data-path='fields.feelingIntensity']").count();
  if (diagnosticIntensityCount !== 1) {
    throw new Error(`Diagnostic feeling intensity range was not rendered: ${diagnosticIntensityCount}`);
  }
  const savedAfterBlankDiagnostic = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length;
  });

  await page.locator("#newActionsButton").click();
  const actionSectionTitles = await page.locator("#formRoot .section-header h2").allTextContents();
  const actionFeelingRowsBefore = await page.locator(".feeling-row").count();
  const savedAfterBlankActions = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length;
  });
  if (savedAfterBlankActions !== 1) {
    throw new Error(`Blank actions entry was saved: ${savedAfterBlankActions}`);
  }
  const expectedActionSections = [
    "Ситуация",
    "Чувство и образ себя",
    "Охранительное действие",
    "Избегающее действие",
    "Адаптивное поведение",
    "Заметки"
  ];
  if (expectedActionSections.some((title) => !actionSectionTitles.includes(title))) {
    throw new Error(`Actions sections are incomplete: ${actionSectionTitles.join(", ")}`);
  }

  await page.locator("button[data-add-feeling]").click();
  const actionFeelingRowsAfter = await page.locator(".feeling-row").count();
  await page.locator("input[data-path='fields.feelings.0.name']").fill("Тревога");
  await page.locator("input[data-path='fields.feelings.0.intensity']").fill("80");
  await page.locator("input[data-path='fields.feelings.1.name']").fill("Стыд");
  await page.locator("input[data-path='fields.feelings.1.intensity']").fill("60");
  await page.locator("textarea[data-path='fields.situation']").fill("Нужно попросить помощи");
  await page.locator("textarea[data-path='fields.protectiveAction']").fill("Долго наблюдаю за другими");
  await page.locator("textarea[data-path='fields.avoidantAction']").fill("Откладываю разговор");
  await page.locator("textarea[data-path='fields.adaptiveBehavior']").fill("Подойти и спросить прямо");

  const actionMarkdown = await page.evaluate(() => formatEntryMarkdown(getActiveEntry()));
  const actionPrint = await page.evaluate(() => renderPrintEntry(getActiveEntry()));
  if (!actionMarkdown.includes("Тревога - 80%") || !actionMarkdown.includes("Стыд - 60%")) {
    throw new Error("Actions feelings were not formatted in Markdown");
  }
  if (!actionPrint.includes("Охранительное действие") || !actionPrint.includes("Подойти и спросить прямо")) {
    throw new Error("Actions entry was not included in PDF output");
  }

  await page.locator(".entry-card").filter({ hasText: "Smoke entry" }).click();
  await page.locator("#tagsInput").fill("работа, тревога");
  const notesText = "Инсайт: я быстрее замечаю тревогу.\nОбсудить на встрече.";
  await page.locator("textarea[data-path='notes']").fill(notesText);
  const lastFormTextareaPath = await page.locator("#formRoot textarea").last().getAttribute("data-path");
  if (lastFormTextareaPath !== "notes") {
    throw new Error(`Notes textarea is not the last textarea: ${lastFormTextareaPath}`);
  }
  const savedNotes = await page.evaluate(() => getActiveEntry().notes);
  if (savedNotes !== notesText) {
    throw new Error("Notes were not saved on active entry");
  }

  const rationalizationBefore = await page.locator("textarea[data-path='rationalization.evidenceFor']").count();
  const rationalizationToggle = page.locator("input[data-path='rationalizationEnabled']");
  await rationalizationToggle.scrollIntoViewIfNeeded();
  const scrollBeforeRationalization = await page.evaluate(() => window.scrollY);
  await rationalizationToggle.check();
  const rationalizationAfter = await page.locator("textarea[data-path='rationalization.evidenceFor']").count();
  const lastTextareaAfterRationalization = await page.locator("#formRoot textarea").last().getAttribute("data-path");
  if (lastTextareaAfterRationalization !== "notes") {
    throw new Error(`Notes textarea is not last after rationalization opens: ${lastTextareaAfterRationalization}`);
  }
  const scrollAfterRationalization = await page.evaluate(() => window.scrollY);
  const rationalizationScrollShift = Math.abs(scrollAfterRationalization - scrollBeforeRationalization);
  if (rationalizationScrollShift > 2) {
    throw new Error(`Rationalization toggle changed scrollY by ${rationalizationScrollShift}px`);
  }
  const markdownWithNotes = await page.evaluate(() => formatEntryMarkdown(getActiveEntry()));
  if (!markdownWithNotes.includes("## Заметки") || !markdownWithNotes.includes(notesText)) {
    throw new Error("Notes were not included in Markdown export");
  }
  const printWithNotes = await page.evaluate(() => renderPrintEntry(getActiveEntry()));
  if (!printWithNotes.includes("Заметки") || !printWithNotes.includes("Инсайт: я быстрее замечаю тревогу.")) {
    throw new Error("Notes were not included in PDF export");
  }

  const expectedExportBaseName = await page.evaluate(() => formatExportBaseName(getActiveEntry()));
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#downloadMarkdownButton").click();
  const markdownDownload = await downloadPromise;
  const markdownFileName = markdownDownload.suggestedFilename();
  if (markdownFileName !== `${expectedExportBaseName}.md`) {
    throw new Error(`Unexpected Markdown file name: ${markdownFileName}`);
  }

  await page.evaluate(() => {
    window.__printCalled = false;
    window.__printTitle = "";
    window.print = () => {
      window.__printTitle = document.title;
      window.__printCalled = true;
      window.dispatchEvent(new Event("afterprint"));
    };
  });
  await page.locator("#printButton").click();
  await page.waitForFunction(() => window.__printCalled === true);
  const printTitle = await page.evaluate(() => window.__printTitle);
  if (printTitle !== expectedExportBaseName) {
    throw new Error(`Unexpected PDF title: ${printTitle}`);
  }
  const stillPrinting = await page.evaluate(() => document.body.classList.contains("printing"));
  const titleAfterPrint = await page.title();
  if (titleAfterPrint !== "Стресс-дневник") {
    throw new Error(`Document title was not restored: ${titleAfterPrint}`);
  }

  await browser.close();

  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({
    blankSaved,
    title,
    savedAfterFill,
    savedAfterBlankDiagnostic,
    savedAfterBlankActions,
    diagnosticIntensityCount,
    actionFeelingRowsBefore,
    actionFeelingRowsAfter,
    actionExported: actionMarkdown.includes("Адаптивное поведение"),
    rationalizationBefore,
    rationalizationAfter,
    rationalizationScrollShift,
    notesSaved: savedNotes === notesText,
    markdownFileName,
    printTitle,
    stillPrinting
  }));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function findBrowserPath() {
  const candidates = [
    process.env.BROWSER_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
  ].filter(Boolean);

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error("Chrome or Edge executable was not found.");
  }
  return found;
}
