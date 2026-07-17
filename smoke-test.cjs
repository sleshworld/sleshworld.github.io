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
  const actionHeaders = await page.locator(".actions-table-head [role='columnheader']").allTextContents();
  const actionRowsBefore = await page.locator(".action-table-row").count();
  const savedAfterBlankActions = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length;
  });
  if (savedAfterBlankActions !== 1) {
    throw new Error(`Blank actions entry was saved: ${savedAfterBlankActions}`);
  }
  const expectedActionHeaders = [
    "Ситуация",
    "Чувство в % + какой я буду",
    "Охранительное действие",
    "Избегающее действие",
    "Адаптивное поведение"
  ];
  if (JSON.stringify(actionHeaders) !== JSON.stringify(expectedActionHeaders)) {
    throw new Error(`Actions table headers are incomplete: ${actionHeaders.join(", ")}`);
  }
  if (actionRowsBefore !== 1) {
    throw new Error(`New actions entry should have one row: ${actionRowsBefore}`);
  }
  const compactNotesOpen = await page.locator("details.compact-notes").evaluate((element) => element.open);
  if (compactNotesOpen) throw new Error("Empty actions notes should be collapsed");

  await page.locator("button[data-add-action-row]").click();
  const actionRowsAfter = await page.locator(".action-table-row").count();
  await page.locator("textarea[data-path='fields.actionRows.0.situation']").fill("Нужно попросить помощи");
  await page.locator("textarea[data-path='fields.actionRows.0.feelingsAndSelf']").fill("Тревога 80%, стыд 60%\nКаким буду: слабым");
  await page.locator("textarea[data-path='fields.actionRows.0.protectiveAction']").fill("Долго наблюдаю за другими");
  await page.locator("textarea[data-path='fields.actionRows.0.avoidantAction']").fill("Откладываю разговор");
  await page.locator("textarea[data-path='fields.actionRows.0.adaptiveBehavior']").fill("Подойти и спросить прямо");
  await page.locator("textarea[data-path='fields.actionRows.1.situation']").fill("Нужно отправить сообщение");
  await page.locator("textarea[data-path='fields.actionRows.1.adaptiveBehavior']").fill("Написать коротко и отправить");

  await page.locator("button[data-add-action-row]").click();
  await page.locator("button[data-remove-action-row='2']").click();
  const actionRowsAfterRemove = await page.locator(".action-table-row").count();

  const actionMarkdown = await page.evaluate(() => formatEntryMarkdown(getActiveEntry()));
  const actionPrint = await page.evaluate(() => renderPrintEntry(getActiveEntry()));
  if (!actionMarkdown.includes("## Строка 1") || !actionMarkdown.includes("Тревога 80%, стыд 60%") || !actionMarkdown.includes("## Строка 2")) {
    throw new Error("Actions rows were not formatted in Markdown");
  }
  if (!actionPrint.includes("Строка действий") || !actionPrint.includes("Охранительное действие") || !actionPrint.includes("Написать коротко и отправить")) {
    throw new Error("Actions entry was not included in PDF output");
  }

  const migratedAction = await page.evaluate(() => normalizeEntry({
    type: "actions",
    fields: {
      situation: "Старая ситуация",
      feelings: [{ name: "Тревога", intensity: "70" }],
      selfDefinition: "растерянным",
      protectiveAction: "Перепроверяю"
    }
  }));
  if (!migratedAction.fields.actionRows[0].feelingsAndSelf.includes("Тревога - 70%") || !migratedAction.fields.actionRows[0].feelingsAndSelf.includes("растерянным")) {
    throw new Error("Legacy actions entry was not migrated to the compact table");
  }

  if (process.env.SCREENSHOT_DIR) {
    fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({
      path: path.join(process.env.SCREENSHOT_DIR, "actions-desktop.png"),
      fullPage: true
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: path.join(process.env.SCREENSHOT_DIR, "actions-mobile.png"),
      fullPage: true
    });
    await page.setViewportSize({ width: 1280, height: 720 });
  }

  if (process.env.PDF_OUTPUT) {
    fs.mkdirSync(path.dirname(process.env.PDF_OUTPUT), { recursive: true });
    await page.evaluate(() => {
      window.__pdfReady = false;
      window.print = () => {
        window.__pdfReady = true;
      };
    });
    await page.locator("#printButton").click();
    await page.waitForFunction(() => window.__pdfReady === true);
    await page.pdf({
      path: process.env.PDF_OUTPUT,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true
    });
    await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
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
    actionRowsBefore,
    actionRowsAfter,
    actionRowsAfterRemove,
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
