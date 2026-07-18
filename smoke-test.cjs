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
  await page.goto(pathToFileURL(path.join(__dirname, "index.html")).href, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  if (await page.locator("#newReportButton").count()) {
    throw new Error("Standalone report button is still visible");
  }
  if (await page.locator(".brand-mark").count()) {
    throw new Error("Foreign brand mark is still visible");
  }
  if (await page.title() !== "Психологические практики") {
    throw new Error(`Unexpected application title: ${await page.title()}`);
  }
  if (await page.locator(".brand h1").textContent() !== "Психологические практики") {
    throw new Error("Application heading was not updated");
  }
  if (await page.locator(".storage-note-sign").textContent() !== "!") {
    throw new Error("Storage warning sign is missing");
  }
  const faviconHref = await page.locator("link[rel='icon']").getAttribute("href");
  if (faviconHref !== "favicon.svg" || !fs.existsSync(path.join(__dirname, faviconHref))) {
    throw new Error(`Favicon is missing: ${faviconHref}`);
  }
  const faviconPage = await browser.newPage({ viewport: { width: 128, height: 128 } });
  await faviconPage.goto(pathToFileURL(path.join(__dirname, faviconHref)).href, { waitUntil: "domcontentloaded" });
  if (await faviconPage.locator("svg").count() !== 1) throw new Error("Favicon SVG could not be rendered");
  if (process.env.SCREENSHOT_DIR) {
    fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
    await faviconPage.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "favicon.png") });
  }
  await faviconPage.close();

  const storageIntroOpen = await page.locator("#storageIntroDialog").evaluate((dialog) => dialog.open);
  const storageIntroText = (await page.locator("#storageIntroDialog").innerText()).toLowerCase();
  const homeVisibleBehindIntro = await page.locator("#homeView").isVisible();
  if (
    !storageIntroOpen ||
    !homeVisibleBehindIntro ||
    !storageIntroText.includes("не отправляются на сервер") ||
    !storageIntroText.includes("другом браузере") ||
    !storageIntroText.includes("очистке данных браузера") ||
    !storageIntroText.includes("md или pdf") ||
    !storageIntroText.includes("json") ||
    !storageIntroText.includes("mac")
  ) {
    throw new Error(`Storage intro is incomplete: open=${storageIntroOpen}, home=${homeVisibleBehindIntro}, text=${storageIntroText}`);
  }
  if (process.env.SCREENSHOT_DIR) {
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "storage-intro-desktop.png") });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "storage-intro-mobile.png") });
    await page.setViewportSize({ width: 1280, height: 720 });
  }
  await page.locator("#storageIntroCloseButton").click();
  await page.waitForFunction(() => localStorage.getItem("stress-diary-app.storage-intro-seen.v1") === "1");
  await page.reload();
  const storageIntroReopened = await page.locator("#storageIntroDialog").evaluate((dialog) => dialog.open);
  if (storageIntroReopened) throw new Error("Storage intro was shown more than once");

  const homeVisibleOnLoad = await page.locator("#homeView").isVisible();
  const homeOptionCount = await page.locator(".home-option").count();
  const homeOptionIndexCount = await page.locator(".home-option-index").count();
  const topbarHiddenOnHome = !await page.locator("#topbar").isVisible();
  const backupHiddenAtZero = !await page.locator("#backupStatus").isVisible();
  if (!homeVisibleOnLoad || homeOptionCount !== 5 || homeOptionIndexCount !== 0 || !topbarHiddenOnHome || !backupHiddenAtZero) {
    throw new Error(`Home is incomplete: visible=${homeVisibleOnLoad}, options=${homeOptionCount}, indexes=${homeOptionIndexCount}, topbarHidden=${topbarHiddenOnHome}, backupHidden=${backupHiddenAtZero}`);
  }
  if (process.env.SCREENSHOT_DIR) {
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "home-desktop.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "home-mobile.png"), fullPage: true });
    await page.setViewportSize({ width: 1280, height: 720 });
  }

  const blankSaved = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length;
  });
  await page.locator("[data-home-entry='diary']").click();
  const titleFieldLabel = await page.locator("#titleFieldLabel").textContent();
  const titleFieldPlaceholder = await page.locator("#titleInput").getAttribute("placeholder");
  const initialTitleValue = await page.locator("#titleInput").inputValue();
  if (titleFieldLabel !== "Название дневника" || titleFieldPlaceholder !== "Введите название" || initialTitleValue !== "") {
    throw new Error(`Entry title field is not self-explanatory: label=${titleFieldLabel}, placeholder=${titleFieldPlaceholder}, value=${initialTitleValue}`);
  }
  if (process.env.SCREENSHOT_DIR) {
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "entry-title-field-desktop.png") });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#homeButton").click();
    await page.locator("[data-home-entry='diary']").click();
    const mobileTopbarBox = await page.locator("#topbar").boundingBox();
    if (mobileTopbarBox.y > 1) throw new Error(`Mobile entry did not scroll to the form: topbarY=${mobileTopbarBox.y}`);
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "entry-title-field-mobile.png") });
    await page.setViewportSize({ width: 1280, height: 720 });
  }
  const storageNote = (await page.locator(".storage-note").textContent()).toLowerCase();
  if (
    !storageNote.includes("только в этом браузере") ||
    !storageNote.includes("md или pdf") ||
    !storageNote.includes("json") ||
    !storageNote.includes("сохранить pdf") ||
    !await page.locator(".storage-note").isVisible()
  ) {
    throw new Error(`Storage note is incomplete: ${storageNote}`);
  }

  await page.locator("#titleInput").fill("Smoke entry");
  await page.locator("textarea[data-path='fields.situation']").first().fill("Stress situation");
  await page.locator("button[data-chip-path='fields.coreFeeling']").first().click();
  const customFeelingLabel = await page.locator("input[data-path='fields.coreFeeling']").getAttribute("aria-label");
  if (customFeelingLabel !== "Какое чувство возникает?: другое значение") {
    throw new Error(`Custom feeling input is not labeled: ${customFeelingLabel}`);
  }

  await page.waitForFunction(() => {
    return document.querySelector(".entry-card.active .entry-title")?.textContent === "Smoke entry";
  });

  const title = await page.locator(".entry-card.active .entry-title").textContent();
  const savedAfterFill = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length;
  });
  await page.locator("#homeButton").click();
  const recentEntryTitle = await page.locator("[data-home-entry-id] strong").first().textContent();
  if (!await page.locator("#homeView").isVisible() || recentEntryTitle !== "Smoke entry") {
    throw new Error(`Home did not show the recent entry: ${recentEntryTitle}`);
  }
  await page.locator("[data-home-entry-id]").first().click();
  if (await page.locator("#titleInput").inputValue() !== "Smoke entry") {
    throw new Error("Recent entry did not open from home");
  }
  await page.locator("#duplicateButton").click();
  await page.locator("#deleteButton").click();
  const deleteDialogOpen = await page.locator("#deleteDialog").evaluate((dialog) => dialog.open);
  const deleteDialogRecord = await page.locator("#deleteDialogRecord").textContent();
  const deleteButtonBox = await page.locator("#confirmDeleteButton").boundingBox();
  const keepButtonBox = await page.locator("#cancelDeleteButton").boundingBox();
  if (!deleteDialogOpen || deleteDialogRecord !== "Smoke entry - копия" || deleteButtonBox.x >= keepButtonBox.x) {
    throw new Error(`Delete dialog is incomplete: open=${deleteDialogOpen}, record=${deleteDialogRecord}`);
  }
  if (process.env.SCREENSHOT_DIR) {
    fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "delete-dialog-desktop.png") });
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileDeleteButtonBox = await page.locator("#confirmDeleteButton").boundingBox();
    const mobileKeepButtonBox = await page.locator("#cancelDeleteButton").boundingBox();
    if (mobileDeleteButtonBox.x >= mobileKeepButtonBox.x) throw new Error("Delete button is not left of keep button on mobile");
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "delete-dialog-mobile.png") });
    await page.setViewportSize({ width: 1280, height: 720 });
  }
  await page.locator("#cancelDeleteButton").click();
  const savedAfterDeleteCancel = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length;
  });
  if (savedAfterDeleteCancel !== 2) throw new Error("Canceling delete removed the entry");
  await page.locator("#deleteButton").click();
  await page.locator("#confirmDeleteButton").click();
  await page.waitForFunction(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length === 1;
  });
  const savedAfterDeleteConfirm = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length;
  });
  if (savedAfterDeleteConfirm !== 1 || await page.locator("#titleInput").inputValue() !== "Smoke entry") {
    throw new Error("Confirming delete did not remove only the selected entry");
  }
  await page.locator("#newDiagnosticButton").click();
  const diagnosticIntensityCount = await page.locator("input[type='range'][data-path='fields.feelingIntensity']").count();
  if (diagnosticIntensityCount !== 1) {
    throw new Error(`Diagnostic feeling intensity range was not rendered: ${diagnosticIntensityCount}`);
  }
  const savedAfterBlankDiagnostic = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length;
  });

  if (process.env.DIAGNOSTIC_PDF_OUTPUT) {
    await page.locator("#titleInput").fill("Диагностика: выступление");
    await page.locator("textarea[data-path='fields.situation']").fill("На встрече нужно представить свою работу перед незнакомой командой.");
    await page.locator("textarea[data-path='fields.bodySensations']").fill("Сжимается грудь, напряжены плечи, становится жарко.");
    await page.locator("textarea[data-path='fields.feelingName']").fill("Тревога и стыд");
    await page.locator("textarea[data-path='fields.amplification']").fill("Я собьюсь, повиснет тишина, и все заметят мою растерянность.");
    await page.locator("textarea[data-path='fields.selfDefinition']").fill("Некомпетентным");
    await page.locator("textarea[data-path='fields.amplificationMore']").fill("Руководитель начнет задавать вопросы, на которые я не смогу ответить.");
    await page.locator("textarea[data-path='fields.selfDefinitionStronger']").fill("Беспомощным");
    await page.locator("textarea[data-path='fields.otherDefinitions']").fill("Критичными и более уверенными");
    await page.locator("textarea[data-path='fields.worldDefinition']").fill("Требовательным и небезопасным для ошибок");
    await page.locator("textarea[data-path='fields.amplifierPerson']").fill("Строгий учитель из школы");
    await page.locator("textarea[data-path='fields.amplifierAction']").fill("Скажет, что я снова плохо подготовился.");
    await page.locator("textarea[data-path='fields.worseVariant']").fill("Знакомые коллеги будут обсуждать выступление после встречи.");
    await page.locator("textarea[data-path='fields.childhoodMemory']").fill("Ответ у доски, когда я забыл следующую фразу и услышал смех.");
    await saveCurrentPdf(page, process.env.DIAGNOSTIC_PDF_OUTPUT);
    await page.evaluate(() => {
      const diagnosticId = getActiveEntry().id;
      entries = entries.filter((entry) => entry.id !== diagnosticId);
      activeId = entries[0]?.id || "";
      save();
      render();
    });
  }

  await page.locator("#newScenarioButton").click();
  const savedAfterBlankScenario = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length;
  });
  if (savedAfterBlankScenario !== 1) {
    throw new Error(`Blank scenario was saved: ${savedAfterBlankScenario}`);
  }
  await page.locator("input[data-path='reportEnabled']").check();
  const savedAfterBlankScenarioToggle = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length;
  });
  await page.locator("input[data-path='reportEnabled']").uncheck();
  if (savedAfterBlankScenarioToggle !== 1) {
    throw new Error(`Blank scenario was saved by report toggle: ${savedAfterBlankScenarioToggle}`);
  }
  const scenarioDateLabel = await page.locator("#entryDateLabel").textContent();
  if (scenarioDateLabel !== "Дата выполнения") throw new Error(`Unexpected scenario date label: ${scenarioDateLabel}`);
  const scenarioStepLabel = await page.locator("textarea[data-path='fields.steps.0']").getAttribute("aria-label");
  if (scenarioStepLabel !== "Что я буду делать шаг за шагом?, строка 1") {
    throw new Error(`Scenario step textarea is not labeled: ${scenarioStepLabel}`);
  }
  await page.locator("#titleInput").fill("Сценарий: кофейня");
  await page.locator("textarea[data-path='fields.purpose']").fill("Научиться спокойно оставаться заметным");
  await page.locator("textarea[data-path='fields.triggerSituation']").fill("Заказать кофе и ждать в центре зала без телефона");
  await page.locator("textarea[data-path='fields.safetyRationale']").fill("Публичное место, есть выход, максимум последствий — неловкость");
  await page.locator("input[data-path='fields.plannedTime']").fill("12:30");
  await page.locator("input[data-path='fields.minimumDuration']").fill("15");
  await page.locator("textarea[data-path='fields.steps.0']").fill("Выйти из дома в выбранной одежде");
  await page.locator("button[data-add-entry-list='steps']").click();
  await page.locator("textarea[data-path='fields.steps.1']").fill("Заказать большой фильтр и ждать у стойки");
  await page.locator("button[data-move-entry-list='-1'][data-list-key='steps'][data-list-index='1']").click();
  const movedScenarioStep = await page.evaluate(() => getActiveEntry().fields.steps[0]);
  if (movedScenarioStep !== "Заказать большой фильтр и ждать у стойки") {
    throw new Error("Scenario steps could not be reordered");
  }
  await page.locator("textarea[data-path='fields.noDoActions.0']").fill("Не доставать телефон");
  await page.locator("button[data-add-entry-list='noDoActions']").click();
  await page.locator("textarea[data-path='fields.noDoActions.1']").fill("Не ходить туда-сюда");
  await page.locator("textarea[data-path='fields.bodyFocus']").fill("Наблюдать сжатие в плечах");
  await page.locator("textarea[data-path='fields.completionCriteria']").fill("Просидеть 15 минут и уйти спокойным шагом");
  const scenarioId = await page.evaluate(() => getActiveEntry().id);
  const scenarioMarkdown = await page.evaluate(() => formatEntryMarkdown(getActiveEntry()));
  const scenarioPrint = await page.evaluate(() => renderPrintEntry(getActiveEntry()));
  if (!scenarioMarkdown.includes("1. Заказать большой фильтр") || !scenarioMarkdown.includes("- Не доставать телефон") || !scenarioMarkdown.includes("15 мин")) {
    throw new Error("Scenario was not formatted correctly in Markdown");
  }
  if (!scenarioPrint.includes("Маршрут") || !scenarioPrint.includes("Не ходить туда-сюда")) {
    throw new Error("Scenario was not included in PDF output");
  }

  if (process.env.SCREENSHOT_DIR) {
    fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "scenario-desktop.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "scenario-mobile.png"), fullPage: true });
    await page.setViewportSize({ width: 1280, height: 720 });
  }
  if (process.env.SCENARIO_PDF_OUTPUT) {
    await saveCurrentPdf(page, process.env.SCENARIO_PDF_OUTPUT);
  }

  const reportBefore = await page.locator("textarea[data-path='report.actualEvents.0']").count();
  const reportToggle = page.locator("input[data-path='reportEnabled']");
  await reportToggle.scrollIntoViewIfNeeded();
  const scrollBeforeReport = await page.evaluate(() => window.scrollY);
  await reportToggle.check();
  const scrollAfterReport = await page.evaluate(() => window.scrollY);
  const reportScrollShift = Math.abs(scrollAfterReport - scrollBeforeReport);
  const reportAfter = await page.locator("textarea[data-path='report.actualEvents.0']").count();
  const scenarioIdAfterReportOpen = await page.evaluate(() => getActiveEntry().id);
  if (reportBefore !== 0 || reportAfter !== 1 || reportScrollShift > 2 || scenarioIdAfterReportOpen !== scenarioId) {
    throw new Error(`Embedded report did not open in place: before=${reportBefore}, after=${reportAfter}, shift=${reportScrollShift}`);
  }
  await page.locator("input[data-path='report.reportDate']").fill("2026-07-17");
  await page.locator("textarea[data-path='report.planChanges']").fill("На улице похолодало, надел куртку");
  await page.locator("textarea[data-path='report.actualEvents.0']").fill("Дошёл до кофейни, плечи начало сжимать");
  await page.locator("button[data-add-entry-list='actualEvents']").click();
  await page.locator("textarea[data-path='report.actualEvents.1']").fill("Заказал кофе и ждал без телефона");
  await page.locator("input[data-path='report.feelingBefore']").fill("45");
  await page.locator("input[data-path='report.feelingPeak']").fill("75");
  await page.locator("input[data-path='report.feelingAfter']").fill("20");
  await page.locator("textarea[data-path='report.escapeSlips']").fill("Один раз ускорил шаг");
  await page.locator("textarea[data-path='report.observedFacts']").fill("Люди занимались своими делами");
  await page.locator("textarea[data-path='report.learning']").fill("Чувство можно выдержать без спасения");
  const reportMarkdown = await page.evaluate(() => formatEntryMarkdown(getActiveEntry()));
  const reportPrint = await page.evaluate(() => renderPrintEntry(getActiveEntry()));
  if (!reportMarkdown.includes("# Отчёт по сценарию") || !reportMarkdown.includes("17.07.2026") || !reportMarkdown.includes("75%")) {
    throw new Error("Embedded report was not formatted correctly in Markdown");
  }
  if (!reportPrint.includes("Отчёт по сценарию") || !reportPrint.includes("Динамика чувства") || !reportPrint.includes("Люди занимались своими делами")) {
    throw new Error("Embedded report was not included in PDF output");
  }

  if (process.env.SCREENSHOT_DIR) {
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "scenario-with-report-desktop.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "scenario-with-report-mobile.png"), fullPage: true });
    await page.setViewportSize({ width: 1280, height: 720 });
  }
  if (process.env.REPORT_PDF_OUTPUT) {
    await saveCurrentPdf(page, process.env.REPORT_PDF_OUTPUT);
  }

  const savedEntryCountBeforeRegistries = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length;
  });
  if (savedEntryCountBeforeRegistries !== 2) {
    throw new Error(`Scenario was not saved as one combined entry: ${savedEntryCountBeforeRegistries}`);
  }

  await page.locator("#actionsPageButton").click();
  const actionsPageTitle = await page.locator("#registryTitle").textContent();
  if (await page.locator("#titleField").isVisible()) {
    throw new Error("Entry title field is visible on the actions registry");
  }
  const actionsNavigationPressed = await page.locator("#actionsPageButton").getAttribute("aria-pressed");
  const actionsDuplicateHidden = await page.locator("#duplicateButton").evaluate((element) => element.classList.contains("hidden"));
  const actionsMetaHidden = await page.locator("#entryMetaRow").evaluate((element) => element.classList.contains("hidden"));
  const actionHeaders = await page.locator(".actions-table-head [role='columnheader']").allTextContents();
  const actionRowsBefore = await page.locator(".action-table-row").count();
  const savedAfterBlankActions = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length;
  });
  if (savedAfterBlankActions !== savedEntryCountBeforeRegistries) {
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
  if (!actionMarkdown.includes("| № | Ситуация |") || !actionMarkdown.includes("Тревога 80%, стыд 60%<br>Каким буду: слабым") || !actionMarkdown.includes("| 2 |")) {
    throw new Error("Actions rows were not formatted as a Markdown table");
  }
  if (!actionPrint.includes("print-registry-table-actions") || !actionPrint.includes("<thead>") || !actionPrint.includes("Охранительное действие") || !actionPrint.includes("Написать коротко и отправить") || actionPrint.includes("print-section-header")) {
    throw new Error("Actions were not included as a table in PDF output");
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
  if (process.env.ACTIONS_PDF_OUTPUT) {
    await saveCurrentPdf(page, process.env.ACTIONS_PDF_OUTPUT);
  }

  await page.locator("#triggersPageButton").click();
  if (await page.locator("#titleField").isVisible()) {
    throw new Error("Entry title field is visible on the triggers registry");
  }
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
  if (!triggerMarkdown.includes("| № | Ситуация / триггер |") || !triggerMarkdown.includes("15%") || !triggerMarkdown.includes("Спросить дорогу у прохожего")) {
    throw new Error("Trigger rows were not formatted as a Markdown table");
  }
  if (!triggerPrint.includes("print-registry-table-triggers") || !triggerPrint.includes("<thead>") || !triggerPrint.includes("Список триггеров") || !triggerPrint.includes("Иду только со знакомым") || triggerPrint.includes("print-section-header")) {
    throw new Error("Trigger rows were not included as a table in PDF output");
  }
  const entriesAfterRegistries = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]");
  });
  if (entriesAfterRegistries.length !== savedEntryCountBeforeRegistries || entriesAfterRegistries.some((entry) => entry.type === "actions")) {
    throw new Error("Registry page created a sidebar entry");
  }

  const backupPromise = page.waitForEvent("download");
  const backupStatusBeforeHidden = await page.locator("#backupStatus").evaluate((status) => status.classList.contains("hidden"));
  if (!backupStatusBeforeHidden) throw new Error("Backup status was shown before three new entries existed");
  await page.locator("#backupButton").click();
  const backupDownload = await backupPromise;
  const backupFileName = backupDownload.suggestedFilename();
  const backupPayload = JSON.parse(fs.readFileSync(await backupDownload.path(), "utf8"));
  if (
    backupPayload.version !== 2 ||
    backupPayload.actionRows.length !== 2 ||
    backupPayload.triggerRows.length !== 2 ||
    !backupPayload.entries.some((entry) => entry.type === "scenario" && entry.reportEnabled && entry.report.actualEvents.length === 2) ||
    backupPayload.entries.some((entry) => entry.type === "report")
  ) {
    throw new Error("Backup does not include the combined scenario and both registries");
  }
  if (!backupFileName.startsWith("Практики_резервная_копия_")) {
    throw new Error(`Unexpected backup file name: ${backupFileName}`);
  }
  const backupStatusAfterHidden = await page.locator("#backupStatus").evaluate((status) => status.classList.contains("hidden"));
  if (!backupStatusAfterHidden) throw new Error("Backup status appeared after its current entries were backed up");

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

  if (process.env.DIARY_PDF_OUTPUT) {
    await page.locator("textarea[data-path='fields.bodySensations']").fill("Тяжесть в груди и напряжение в челюсти.");
    await page.locator("textarea[data-path='fields.bodyFeelingName']").fill("Тревога");
    await page.locator("textarea[data-path='fields.thoughtsFlow']").fill("Я не успею. Результат окажется слабым. Все поймут, что я не справляюсь.");
    await page.locator("textarea[data-path='fields.worstThought']").fill("Я не справлюсь и разочарую команду.");
    await page.locator("textarea[data-path='fields.selfDefinition']").fill("Несостоятельным");
    await page.locator("textarea[data-path='fields.otherDefinitions']").fill("Требовательными и оценивающими");
    await page.locator("textarea[data-path='fields.worldDefinition']").fill("Местом, где нельзя ошибаться");
    await page.locator("textarea[data-path='fields.behavior']").fill("Откладываю задачу, перепроверяю мелочи и открываю соцсети.");
    await page.locator("textarea[data-path='fields.problemSolved']").fill("Временно снижало тревогу, но реальную задачу не решало.");
    await page.locator("textarea[data-path='rationalization.evidenceFor']").fill("Раньше я действительно срывал один похожий срок.");
    await page.locator("textarea[data-path='rationalization.evidenceAgainst']").fill("Большинство задач я завершал, а коллеги помогали уточнить требования.");
    await page.locator("textarea[data-path='rationalization.alternativeView']").fill("Тревога говорит о важности задачи, а не доказывает будущий провал.");
    await page.locator("textarea[data-path='rationalization.realisticOutcome']").fill("Я сделаю рабочую версию, попрошу обратную связь и поправлю детали.");
    await page.locator("textarea[data-path='rationalization.nextAction']").fill("Открыть задачу и за 20 минут собрать первый черновик.");
    await saveCurrentPdf(page, process.env.DIARY_PDF_OUTPUT);
  }

  const expectedExportBaseName = await page.evaluate(() => formatExportBaseName(getActiveEntry()));
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#downloadMarkdownButton").click();
  const markdownDownload = await downloadPromise;
  const markdownFileName = markdownDownload.suggestedFilename();
  if (markdownFileName !== `${expectedExportBaseName}.md`) {
    throw new Error(`Unexpected Markdown file name: ${markdownFileName}`);
  }

  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => {
    window.__printCalled = false;
    window.__printTitle = "";
    window.__printSectionBreak = "";
    window.print = () => {
      window.__printTitle = document.title;
      window.__printSectionBreak = getComputedStyle(document.querySelector(".print-section")).breakInside;
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
  const desktopPrintSectionBreak = await page.evaluate(() => window.__printSectionBreak);
  if (desktopPrintSectionBreak !== "avoid") {
    throw new Error(`Desktop PDF sections may split across pages: ${desktopPrintSectionBreak}`);
  }
  await page.emulateMedia({ media: "screen" });
  const stillPrinting = await page.evaluate(() => document.body.classList.contains("printing"));
  const titleAfterPrint = await page.title();
  if (titleAfterPrint !== "Психологические практики") {
    throw new Error(`Document title was not restored: ${titleAfterPrint}`);
  }

  const migrationPage = await browser.newPage();
  await migrationPage.goto(pathToFileURL(path.join(__dirname, "index.html")).href, { waitUntil: "domcontentloaded", timeout: 15000 });
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

  const reportMigrationPage = await browser.newPage();
  await reportMigrationPage.goto(pathToFileURL(path.join(__dirname, "index.html")).href, { waitUntil: "domcontentloaded", timeout: 15000 });
  await reportMigrationPage.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("stress-diary-app.entries.v1", JSON.stringify([
      {
        id: "legacy-scenario",
        type: "scenario",
        title: "Сценарий: разговор",
        date: "2026-07-16",
        fields: { purpose: "Начать разговор", steps: ["Подойти"], noDoActions: ["Не смотреть в телефон"] },
        rationalization: {},
        notes: "",
        createdAt: "2026-07-16T10:00:00.000Z",
        updatedAt: "2026-07-16T10:00:00.000Z"
      },
      {
        id: "legacy-linked-report",
        type: "report",
        title: "Отчёт: разговор",
        date: "2026-07-17",
        fields: { linkedScenarioId: "legacy-scenario", actualEvents: ["Подошёл и поздоровался"], feelingPeak: 70 },
        rationalization: {},
        notes: "Сохранил контакт",
        createdAt: "2026-07-17T10:00:00.000Z",
        updatedAt: "2026-07-17T10:00:00.000Z"
      },
      {
        id: "legacy-unlinked-report",
        type: "report",
        title: "Отчёт: магазин",
        date: "2026-07-15",
        fields: { actualEvents: ["Задал вопрос продавцу"] },
        rationalization: {},
        notes: "Было проще, чем ожидал",
        createdAt: "2026-07-15T10:00:00.000Z",
        updatedAt: "2026-07-15T10:00:00.000Z"
      }
    ]));
    localStorage.setItem("stress-diary-app.active-id.v1", "legacy-linked-report");
  });
  await reportMigrationPage.reload();
  const reportMigrationResult = await reportMigrationPage.evaluate(() => ({
    entries: JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]"),
    activeId: localStorage.getItem("stress-diary-app.active-id.v1")
  }));
  const migratedLinkedScenario = reportMigrationResult.entries.find((entry) => entry.id === "legacy-scenario");
  const migratedStandaloneReport = reportMigrationResult.entries.find((entry) => entry.id === "legacy-unlinked-report");
  if (
    reportMigrationResult.entries.some((entry) => entry.type === "report") ||
    reportMigrationResult.activeId !== "legacy-scenario" ||
    migratedLinkedScenario?.report?.actualEvents?.[0] !== "Подошёл и поздоровался" ||
    migratedLinkedScenario?.report?.notes !== "Сохранил контакт" ||
    migratedStandaloneReport?.type !== "scenario" ||
    migratedStandaloneReport?.report?.actualEvents?.[0] !== "Задал вопрос продавцу"
  ) {
    throw new Error("Legacy reports were not migrated into scenarios without data loss");
  }
  await reportMigrationPage.close();

  const importPage = await browser.newPage();
  await importPage.goto(pathToFileURL(path.join(__dirname, "index.html")).href, { waitUntil: "domcontentloaded", timeout: 15000 });
  await importPage.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("stress-diary-app.entries.v1", JSON.stringify([{
      id: "scenario-import",
      type: "scenario",
      title: "Существующий сценарий",
      date: "2026-07-17",
      fields: { purpose: "Проверка конфликта", steps: [""], noDoActions: [""] },
      rationalization: {},
      notes: "",
      createdAt: "2026-07-17T00:00:00.000Z",
      updatedAt: "2026-07-17T00:00:00.000Z"
    }]));
  });
  await importPage.reload();
  await importPage.locator("#importFileInput").setInputFiles({
    name: "backup-v2.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({
      version: 2,
      entries: [
        {
          id: "scenario-import",
          type: "scenario",
          title: "Импортированный сценарий",
          date: "2026-07-17",
          fields: { purpose: "Новый план", steps: ["Первый шаг"], noDoActions: ["Не спешить"] },
          rationalization: {},
          notes: "",
          createdAt: "2026-07-17T01:00:00.000Z",
          updatedAt: "2026-07-17T01:00:00.000Z"
        },
        {
          id: "report-import",
          type: "report",
          title: "Импортированный отчёт",
          date: "2026-07-17",
          fields: { linkedScenarioId: "scenario-import", actualEvents: ["Первый эпизод"] },
          rationalization: {},
          notes: "",
          createdAt: "2026-07-17T02:00:00.000Z",
          updatedAt: "2026-07-17T02:00:00.000Z"
        }
      ],
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
    entries: JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]"),
    actionRows: JSON.parse(localStorage.getItem("stress-diary-app.action-rows.v1") || "[]"),
    triggerRows: JSON.parse(localStorage.getItem("stress-diary-app.trigger-rows.v1") || "[]")
  }));
  if (importResult.actionRows[0].situation !== "Импортированное действие" || importResult.triggerRows[0].difficulty !== 25) {
    throw new Error("Version 2 registry backup was not imported");
  }
  const importedScenario = importResult.entries.find((entry) => entry.title === "Импортированный сценарий");
  if (
    !importedScenario ||
    importedScenario.id === "scenario-import" ||
    !importedScenario.reportEnabled ||
    importedScenario.report.actualEvents[0] !== "Первый эпизод" ||
    importResult.entries.some((entry) => entry.type === "report")
  ) {
    throw new Error("Imported report was not embedded into its remapped scenario");
  }
  await importPage.close();

  const backupReminderPage = await browser.newPage();
  await backupReminderPage.goto(pathToFileURL(path.join(__dirname, "index.html")).href, { waitUntil: "domcontentloaded", timeout: 15000 });
  await backupReminderPage.evaluate(() => localStorage.clear());
  await backupReminderPage.reload();
  await backupReminderPage.locator("#storageIntroCloseButton").click();
  await backupReminderPage.evaluate(() => {
    for (let index = 1; index <= 2; index += 1) {
      createEntry("diary", {
        title: `Запись ${index}`,
        fields: { situation: `Ситуация ${index}` },
        silent: true
      });
    }
  });
  const backupStatusHiddenAtTwo = !await backupReminderPage.locator("#backupStatus").isVisible();
  if (!backupStatusHiddenAtTwo) throw new Error("Backup reminder appeared before three new entries");
  await backupReminderPage.evaluate(() => {
    createEntry("diary", {
      title: "Запись 3",
      fields: { situation: "Ситуация 3" },
      silent: true
    });
  });
  const backupReminderVisible = await backupReminderPage.locator("#backupStatus").isVisible();
  const backupReminderTitle = await backupReminderPage.locator("#backupStatusTitle").textContent();
  const backupReminderDetail = await backupReminderPage.locator("#backupStatusDetail").textContent();
  const backupReminderSignCount = await backupReminderPage.locator(".backup-status-sign").count();
  if (!backupReminderVisible || backupReminderSignCount !== 0 || backupReminderTitle !== "Добавлено 3 новых записи" || backupReminderDetail !== "Лучше сохранить резервную копию.") {
    throw new Error(`Backup reminder threshold is incorrect: visible=${backupReminderVisible}, title=${backupReminderTitle}, detail=${backupReminderDetail}`);
  }
  if (process.env.SCREENSHOT_DIR) {
    await backupReminderPage.locator(".sidebar").screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "backup-threshold-desktop.png") });
    await backupReminderPage.setViewportSize({ width: 390, height: 844 });
    await backupReminderPage.locator(".sidebar").screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "backup-threshold-mobile.png") });
    await backupReminderPage.setViewportSize({ width: 1280, height: 720 });
  }
  const thresholdBackupPromise = backupReminderPage.waitForEvent("download");
  await backupReminderPage.locator("#backupButton").click();
  await thresholdBackupPromise;
  const backupStatusHiddenAfterSave = !await backupReminderPage.locator("#backupStatus").isVisible();
  if (!backupStatusHiddenAfterSave) throw new Error("Backup reminder remained visible after JSON download");
  await backupReminderPage.locator("#titleInput").fill("Запись 3 изменена");
  const backupStatusHiddenAfterEdit = !await backupReminderPage.locator("#backupStatus").isVisible();
  if (!backupStatusHiddenAfterEdit) throw new Error("Editing an existing entry triggered the backup reminder");
  await backupReminderPage.evaluate(() => {
    for (let index = 4; index <= 5; index += 1) {
      createEntry("diary", {
        title: `Запись ${index}`,
        fields: { situation: `Ситуация ${index}` },
        silent: true
      });
    }
  });
  const backupStatusHiddenAfterTwoMore = !await backupReminderPage.locator("#backupStatus").isVisible();
  if (!backupStatusHiddenAfterTwoMore) throw new Error("Backup reminder appeared after only two new entries since backup");
  await backupReminderPage.evaluate(() => {
    createEntry("diary", {
      title: "Запись 6",
      fields: { situation: "Ситуация 6" },
      silent: true
    });
  });
  const backupReminderVisibleAgain = await backupReminderPage.locator("#backupStatus").isVisible();
  if (!backupReminderVisibleAgain) throw new Error("Backup reminder did not reappear after three more new entries");
  await backupReminderPage.close();

  const lastDeletePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await lastDeletePage.goto(pathToFileURL(path.join(__dirname, "index.html")).href, { waitUntil: "domcontentloaded", timeout: 15000 });
  await lastDeletePage.evaluate(() => localStorage.clear());
  await lastDeletePage.reload();
  await lastDeletePage.locator("#storageIntroCloseButton").click();
  await lastDeletePage.locator("[data-home-entry='diary']").click();
  await lastDeletePage.locator("#titleInput").fill("Единственная запись");
  await lastDeletePage.locator("textarea[data-path='fields.situation']").fill("Ситуация для проверки удаления");
  await lastDeletePage.locator("#deleteButton").click();
  await lastDeletePage.locator("#confirmDeleteButton").click();
  await lastDeletePage.waitForFunction(() => document.querySelector("#homeView") && !document.querySelector("#homeView").classList.contains("hidden"));
  const lastDeleteState = await lastDeletePage.evaluate(() => ({
    storedEntries: JSON.parse(localStorage.getItem("stress-diary-app.entries.v1") || "[]").length,
    homeVisible: !document.querySelector("#homeView").classList.contains("hidden"),
    emptyStateVisible: !document.querySelector("#emptyState").classList.contains("hidden")
  }));
  if (lastDeleteState.storedEntries !== 0 || !lastDeleteState.homeVisible || lastDeleteState.emptyStateVisible) {
    throw new Error(`Deleting the last entry did not return home: ${JSON.stringify(lastDeleteState)}`);
  }
  await lastDeletePage.close();

  const mobilePrintPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePrintPage.goto(pathToFileURL(path.join(__dirname, "index.html")).href, { waitUntil: "domcontentloaded", timeout: 15000 });
  await mobilePrintPage.evaluate(() => localStorage.clear());
  await mobilePrintPage.reload();
  await mobilePrintPage.locator("#storageIntroCloseButton").click();
  await mobilePrintPage.locator("[data-home-entry='diary']").click();
  await mobilePrintPage.locator("#titleInput").fill("Мобильная проверка длинного названия записи без наложений");
  await mobilePrintPage.locator("textarea[data-path='fields.situation']").fill(
    Array.from({ length: 18 }, (_, index) => `Абзац ${index + 1}. Длинный текст должен свободно переноситься между строками и страницами без наложения на соседние поля.`).join("\n\n")
  );
  await mobilePrintPage.emulateMedia({ media: "print" });
  await mobilePrintPage.evaluate(() => {
    elements.toast.classList.remove("visible");
    elements.toast.textContent = "";
    window.__mobilePrintState = null;
    window.print = () => {
      const meta = document.querySelector(".print-meta");
      const field = document.querySelector(".print-field");
      const section = document.querySelector(".print-section");
      window.__mobilePrintState = {
        isMobilePrint: document.body.classList.contains("mobile-print"),
        appDisplay: getComputedStyle(document.querySelector(".app-shell")).display,
        toastDisplay: getComputedStyle(elements.toast).display,
        toastText: elements.toast.textContent,
        printDisplay: getComputedStyle(elements.printRoot).display,
        metaColumns: getComputedStyle(meta).gridTemplateColumns,
        fieldBreak: getComputedStyle(field).breakInside,
        sectionBreak: getComputedStyle(section).breakInside
      };
    };
  });
  await mobilePrintPage.locator("#printButton").click();
  await mobilePrintPage.waitForFunction(() => window.__mobilePrintState !== null);
  const mobilePrintState = await mobilePrintPage.evaluate(() => window.__mobilePrintState);
  if (
    !mobilePrintState.isMobilePrint ||
    mobilePrintState.appDisplay !== "none" ||
    mobilePrintState.toastDisplay !== "none" ||
    mobilePrintState.toastText ||
    mobilePrintState.printDisplay !== "block" ||
    mobilePrintState.metaColumns.trim().split(/\s+/).length !== 1 ||
    mobilePrintState.fieldBreak !== "auto" ||
    mobilePrintState.sectionBreak !== "auto"
  ) {
    throw new Error(`Mobile entry print styles are incomplete: ${JSON.stringify(mobilePrintState)}`);
  }
  if (process.env.SCREENSHOT_DIR) {
    await mobilePrintPage.pdf({
      path: path.join(process.env.SCREENSHOT_DIR, "mobile-entry-print.pdf"),
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true
    });
  }
  await mobilePrintPage.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await mobilePrintPage.emulateMedia({ media: "screen" });

  await mobilePrintPage.locator("#triggersPageButton").click();
  await mobilePrintPage.locator("textarea[data-registry='triggers'][data-row-index='0'][data-key='situation']").fill("Сложная ситуация с длинным описанием для мобильной PDF-версии");
  await mobilePrintPage.locator("input[data-registry='triggers'][data-row-index='0'][data-key='difficulty']").fill("70");
  await mobilePrintPage.locator("textarea[data-registry='triggers'][data-row-index='0'][data-key='avoidanceActions']").fill("Подробное описание охранительно-избегающих действий");
  await mobilePrintPage.emulateMedia({ media: "print" });
  await mobilePrintPage.evaluate(() => {
    window.__mobileRegistryPrintState = null;
    window.print = () => {
      window.__mobileRegistryPrintState = {
        headDisplay: getComputedStyle(document.querySelector(".print-registry-table thead")).display,
        cellDisplay: getComputedStyle(document.querySelector(".print-registry-table td")).display,
        cellLabel: document.querySelector(".print-registry-table td")?.dataset.label || "",
        registryPage: getComputedStyle(document.querySelector(".print-registry")).getPropertyValue("page")
      };
    };
  });
  await mobilePrintPage.locator("#printButton").click();
  await mobilePrintPage.waitForFunction(() => window.__mobileRegistryPrintState !== null);
  const mobileRegistryPrintState = await mobilePrintPage.evaluate(() => window.__mobileRegistryPrintState);
  if (
    mobileRegistryPrintState.headDisplay !== "none" ||
    mobileRegistryPrintState.cellDisplay !== "grid" ||
    !mobileRegistryPrintState.cellLabel ||
    mobileRegistryPrintState.registryPage.trim() !== "auto"
  ) {
    throw new Error(`Mobile registry print styles are incomplete: ${JSON.stringify(mobileRegistryPrintState)}`);
  }
  if (process.env.SCREENSHOT_DIR) {
    await mobilePrintPage.pdf({
      path: path.join(process.env.SCREENSHOT_DIR, "mobile-registry-print.pdf"),
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true
    });
  }
  await mobilePrintPage.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await mobilePrintPage.close();

  await browser.close();

  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({
    blankSaved,
    title,
    savedAfterFill,
    deleteDialogOpen,
    savedAfterDeleteCancel,
    savedAfterDeleteConfirm,
    savedAfterBlankDiagnostic,
    savedAfterBlankScenario,
    savedAfterBlankScenarioToggle,
    embeddedReportOpened: reportBefore === 0 && reportAfter === 1,
    reportScrollShift,
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
    backupStatusBeforeHidden,
    backupStatusAfterHidden,
    backupStatusHiddenAfterSave,
    backupStatusHiddenAfterEdit,
    backupStatusHiddenAfterTwoMore,
    backupReminderVisibleAgain,
    mobilePrintState,
    mobileRegistryPrintState,
    lastDeleteState,
    storageIntroOpen,
    storageIntroReopened,
    backupStatusHiddenAtTwo,
    backupReminderVisible,
    migratedActionRows: migrationResult.actionRows.length,
    migratedLegacyReports: reportMigrationResult.entries.length,
    importedTriggerRows: importResult.triggerRows.length,
    rationalizationBefore,
    rationalizationAfter,
    rationalizationScrollShift,
    notesSaved: savedNotes === notesText,
    markdownFileName,
    printTitle,
    desktopPrintSectionBreak,
    stillPrinting
  }));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function saveCurrentPdf(page, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await page.evaluate(() => {
    window.__artifactPdfReady = false;
    window.print = () => {
      window.__artifactPdfReady = true;
    };
  });
  await page.locator("#printButton").click();
  await page.waitForFunction(() => window.__artifactPdfReady === true);
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true
  });
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
}

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
