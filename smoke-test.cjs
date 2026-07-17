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

  await page.locator("#actionsPageButton").click();
  const actionsPageTitle = await page.locator("#registryTitle").textContent();
  const actionsNavigationPressed = await page.locator("#actionsPageButton").getAttribute("aria-pressed");
  const actionsDuplicateHidden = await page.locator("#duplicateButton").evaluate((element) => element.classList.contains("hidden"));
  const actionsMetaHidden = await page.locator("#entryMetaRow").evaluate((element) => element.classList.contains("hidden"));
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
    throw new Error(`Empty actions registry should render one editable row: ${actionRowsBefore}`);
  }
  if (actionsPageTitle !== "Список действий" || actionsNavigationPressed !== "true" || !actionsDuplicateHidden || !actionsMetaHidden) {
    throw new Error("Actions registry page chrome is incorrect");
  }
  const blankActionRowsStored = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.action-rows.v1") || "[]").length;
  });
  if (blankActionRowsStored !== 0) throw new Error("Blank action row was persisted");

  await page.locator("textarea[data-registry='actions'][data-row-index='0'][data-key='situation']").fill("Нужно попросить помощи");
  await page.locator("textarea[data-registry='actions'][data-row-index='0'][data-key='feelingsAndSelf']").fill("Тревога 80%, стыд 60%\nКаким буду: слабым");
  await page.locator("textarea[data-registry='actions'][data-row-index='0'][data-key='protectiveAction']").fill("Долго наблюдаю за другими");
  await page.locator("textarea[data-registry='actions'][data-row-index='0'][data-key='avoidantAction']").fill("Откладываю разговор");
  await page.locator("textarea[data-registry='actions'][data-row-index='0'][data-key='adaptiveBehavior']").fill("Подойти и спросить прямо");
  await page.locator("button[data-add-registry-row='actions']").click();
  const actionRowsAfter = await page.locator(".action-table-row").count();
  await page.locator("textarea[data-registry='actions'][data-row-index='1'][data-key='situation']").fill("Нужно отправить сообщение");
  await page.locator("textarea[data-registry='actions'][data-row-index='1'][data-key='adaptiveBehavior']").fill("Написать коротко и отправить");

  await page.locator("button[data-add-registry-row='actions']").click();
  await page.locator("button[data-remove-registry-row='2'][data-registry='actions']").click();
  const actionRowsAfterRemove = await page.locator(".action-table-row").count();

  const actionMarkdown = await page.evaluate(() => formatRegistryMarkdown("actions"));
  const actionPrint = await page.evaluate(() => renderPrintRegistry("actions"));
  if (!actionMarkdown.includes("## Строка 1") || !actionMarkdown.includes("Тревога 80%, стыд 60%") || !actionMarkdown.includes("## Строка 2")) {
    throw new Error("Actions rows were not formatted in Markdown");
  }
  if (!actionPrint.includes("Строка действий") || !actionPrint.includes("Охранительное действие") || !actionPrint.includes("Написать коротко и отправить")) {
    throw new Error("Actions entry was not included in PDF output");
  }

  if (process.env.SCREENSHOT_DIR) {
    fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({
      path: path.join(process.env.SCREENSHOT_DIR, "registry-actions-desktop.png"),
      fullPage: true
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: path.join(process.env.SCREENSHOT_DIR, "registry-actions-mobile.png"),
      fullPage: true
    });
    await page.setViewportSize({ width: 1280, height: 720 });
  }

  await page.locator("#triggersPageButton").click();
  const triggerHeaders = await page.locator(".actions-table-head [role='columnheader']").allTextContents();
  const expectedTriggerHeaders = [
    "Ситуация / триггер",
    "Сложность для психики",
    "Охранительно-избегающие действия"
  ];
  if (JSON.stringify(triggerHeaders) !== JSON.stringify(expectedTriggerHeaders)) {
    throw new Error(`Trigger table headers are incomplete: ${triggerHeaders.join(", ")}`);
  }
  await page.locator("textarea[data-registry='triggers'][data-row-index='0'][data-key='situation']").fill("Спросить дорогу у прохожего");
  await page.locator("input[data-registry='triggers'][data-row-index='0'][data-key='difficulty']").fill("15");
  await page.locator("textarea[data-registry='triggers'][data-row-index='0'][data-key='avoidanceActions']").fill("Смотрю карту и не спрашиваю");
  await page.locator("button[data-add-registry-row='triggers']").click();
  await page.locator("textarea[data-registry='triggers'][data-row-index='1'][data-key='situation']").fill("Попросить подстраховать в зале");
  await page.locator("input[data-registry='triggers'][data-row-index='1'][data-key='difficulty']").fill("35");
  await page.locator("textarea[data-registry='triggers'][data-row-index='1'][data-key='avoidanceActions']").fill("Иду только со знакомым");

  const triggerRowsStored = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.trigger-rows.v1") || "[]");
  });
  if (triggerRowsStored.length !== 2 || String(triggerRowsStored[0].difficulty) !== "15") {
    throw new Error("Trigger rows were not persisted");
  }
  const triggerMarkdown = await page.evaluate(() => formatRegistryMarkdown("triggers"));
  const triggerPrint = await page.evaluate(() => renderPrintRegistry("triggers"));
  if (!triggerMarkdown.includes("15%") || !triggerMarkdown.includes("Спросить дорогу у прохожего")) {
    throw new Error("Trigger rows were not formatted in Markdown");
  }
  if (!triggerPrint.includes("Список триггеров") || !triggerPrint.includes("Иду только со знакомым")) {
    throw new Error("Trigger rows were not included in PDF output");
  }
  const entriesAfterRegistries = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]");
  });
  if (entriesAfterRegistries.length !== 1 || entriesAfterRegistries.some((entry) => entry.type === "actions")) {
    throw new Error("Registry page created a sidebar entry");
  }

  const backupPromise = page.waitForEvent("download");
  await page.locator("#backupButton").click();
  const backupDownload = await backupPromise;
  const backupPayload = JSON.parse(fs.readFileSync(await backupDownload.path(), "utf8"));
  if (backupPayload.version !== 2 || backupPayload.actionRows.length !== 2 || backupPayload.triggerRows.length !== 2) {
    throw new Error("Backup does not include both registries");
  }

  if (process.env.SCREENSHOT_DIR) {
    await page.screenshot({
      path: path.join(process.env.SCREENSHOT_DIR, "registry-triggers-desktop.png"),
      fullPage: true
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: path.join(process.env.SCREENSHOT_DIR, "registry-triggers-mobile.png"),
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

  const expectedRegistryExportName = await page.evaluate(() => formatRegistryExportBaseName("triggers"));
  await page.evaluate(() => {
    window.__registryPrintTitle = "";
    window.print = () => {
      window.__registryPrintTitle = document.title;
      window.dispatchEvent(new Event("afterprint"));
    };
  });
  await page.locator("#printButton").click();
  await page.waitForFunction(() => window.__registryPrintTitle !== "");
  const registryPrintTitle = await page.evaluate(() => window.__registryPrintTitle);
  if (registryPrintTitle !== expectedRegistryExportName) {
    throw new Error(`Unexpected registry PDF title: ${registryPrintTitle}`);
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

  const migrationPage = await browser.newPage();
  await migrationPage.goto(pathToFileURL(path.join(__dirname, "index.html")).href);
  await migrationPage.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("stress-diary-app.entries.v1", JSON.stringify([{
      id: "legacy-actions",
      type: "actions",
      title: "Старые действия",
      date: "2026-07-17",
      fields: {
        situation: "Старая ситуация",
        feelings: [{ name: "Тревога", intensity: "70" }],
        selfDefinition: "растерянным",
        protectiveAction: "Перепроверяю"
      },
      rationalization: {},
      notes: ""
    }]));
    localStorage.setItem("stress-diary-app.active-id.v1", "legacy-actions");
  });
  await migrationPage.reload();
  const migrationResult = await migrationPage.evaluate(() => ({
    entries: JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]"),
    actionRows: JSON.parse(localStorage.getItem("stress-diary-app.action-rows.v1") || "[]"),
    activeView: localStorage.getItem("stress-diary-app.active-view.v1")
  }));
  if (migrationResult.entries.some((entry) => entry.type === "actions") || migrationResult.actionRows.length !== 1 || migrationResult.activeView !== "actions") {
    throw new Error("Legacy action entry was not moved out of the sidebar");
  }
  if (!migrationResult.actionRows[0].feelingsAndSelf.includes("Тревога - 70%") || !migrationResult.actionRows[0].feelingsAndSelf.includes("растерянным")) {
    throw new Error("Legacy action fields were not preserved during migration");
  }
  await migrationPage.close();

  const importPage = await browser.newPage();
  await importPage.goto(pathToFileURL(path.join(__dirname, "index.html")).href);
  await importPage.evaluate(() => localStorage.clear());
  await importPage.reload();
  await importPage.locator("#importFileInput").setInputFiles({
    name: "backup-v2.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({
      version: 2,
      entries: [],
      actionRows: [{ situation: "Импортированное действие", adaptiveBehavior: "Сделать прямо" }],
      triggerRows: [{ situation: "Импортированный триггер", difficulty: 25, avoidanceActions: "Отложить" }]
    }), "utf8")
  });
  await importPage.waitForFunction(() => {
    const actions = JSON.parse(localStorage.getItem("stress-diary-app.action-rows.v1") || "[]");
    const triggers = JSON.parse(localStorage.getItem("stress-diary-app.trigger-rows.v1") || "[]");
    return actions.length === 1 && triggers.length === 1;
  });
  const importResult = await importPage.evaluate(() => ({
    actionRows: JSON.parse(localStorage.getItem("stress-diary-app.action-rows.v1") || "[]"),
    triggerRows: JSON.parse(localStorage.getItem("stress-diary-app.trigger-rows.v1") || "[]")
  }));
  if (importResult.actionRows[0].situation !== "Импортированное действие" || importResult.triggerRows[0].difficulty !== 25) {
    throw new Error("Version 2 registry backup was not imported");
  }
  await importPage.close();

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
    actionsPageTitle,
    triggerRowsStored: triggerRowsStored.length,
    registryPrintTitle,
    backupVersion: backupPayload.version,
    migratedActionRows: migrationResult.actionRows.length,
    importedTriggerRows: importResult.triggerRows.length,
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
