const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

const STORAGE = {
  entries: "psychological-practices.entries.v1",
  actions: "psychological-practices.action-rows.v1",
  triggers: "psychological-practices.trigger-rows.v1"
};

(async () => {
  const variant = process.env.TILDA_VARIANT === "multi" ? "multi" : "compressed";
  const embedPath = path.join(__dirname, variant === "multi" ? "tilda-multi-embed.html" : "tilda-embed.html");
  validateBundleFiles(embedPath, variant);

  const browser = await chromium.launch({
    headless: true,
    executablePath: findBrowserPath()
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  const screenshotDir = process.env.SCREENSHOT_DIR || "";
  const pdfOutput = process.env.PDF_OUTPUT || "";
  if (screenshotDir) fs.mkdirSync(screenshotDir, { recursive: true });
  if (pdfOutput) fs.mkdirSync(path.dirname(pdfOutput), { recursive: true });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(pathToFileURL(embedPath).href);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const host = page.locator("#psychological-practices-host");
  await host.locator(".app-shell").waitFor();
  if (variant === "compressed" && await page.locator("#psychological-practices-loader").count()) {
    throw new Error("The compressed Tilda loader remained visible after startup");
  }
  if (variant === "multi" && !(await page.evaluate(() => Boolean(window.PsychologicalPracticesDefinition)))) {
    throw new Error("The readable practice definition was not exposed for inspection");
  }

  const storageIntro = host.locator("#storageIntroDialog");
  if (!(await storageIntro.evaluate((dialog) => dialog.open))) {
    throw new Error("The local-storage introduction did not open on the first visit");
  }
  if (!(await host.locator("#homeView").isVisible())) {
    throw new Error("The Tilda bundle did not open on Home");
  }
  await host.locator("#storageIntroCloseButton").click();
  if (screenshotDir) {
    await page.screenshot({ path: path.join(screenshotDir, "tilda-home-desktop.png"), fullPage: true });
  }

  await page.addStyleTag({
    content: ".button, button, input, textarea, dialog { display: none !important; }"
  });
  if (!(await host.locator("[data-home-entry='diary']").isVisible())) {
    throw new Error("Tilda-like global styles leaked into the embedded application");
  }

  await host.locator("[data-home-entry='diary']").click();
  await host.locator("#titleInput").fill("Tilda: рабочий дневник");
  await host.locator("textarea[data-path='fields.situation']").fill("Проверка дневника внутри Tilda");
  await host.locator("#tagsInput").fill("tilda, тест");

  await host.locator("#newDiagnosticButton").click();
  await host.locator("#titleInput").fill("Tilda: диагностика");
  await host.locator("textarea[data-path='fields.situation']").fill("Проверка диагностики внутри Tilda");

  await host.locator("#newMvaButton").click();
  await host.locator("#titleInput").fill("Tilda: MVA");
  await host.locator("textarea[data-path='fields.request']").fill("Найти следующее действие внутри Tilda");
  await host.locator("textarea[data-path='fields.mostValuableAction']").fill("Отправить одно конкретное сообщение");
  if (screenshotDir) {
    await page.screenshot({ path: path.join(screenshotDir, "tilda-mva-desktop.png"), fullPage: true });
  }

  await host.locator("#newScenarioButton").click();
  await host.locator("#titleInput").fill("Tilda: сценарий");
  await host.locator("textarea[data-path^='fields.']").first().fill("Первый наблюдаемый шаг сценария");
  await host.locator("input[data-path='reportEnabled']").check();
  await host.locator("textarea[data-path='report.actualEvents.0']").fill("Сценарий выполнен по плану");
  if (screenshotDir) {
    await page.screenshot({ path: path.join(screenshotDir, "tilda-scenario-desktop.png"), fullPage: true });
  }

  const entries = await readStored(page, STORAGE.entries);
  if (
    entries.length !== 4 ||
    !entries.some((entry) => entry.type === "diary") ||
    !entries.some((entry) => entry.type === "diagnostic") ||
    !entries.some((entry) => entry.type === "mva" && entry.fields.mostValuableAction) ||
    !entries.some((entry) => entry.type === "scenario" && entry.reportEnabled)
  ) {
    throw new Error(`Entry persistence failed: ${JSON.stringify(entries.map((entry) => entry.type))}`);
  }

  await host.locator("#actionsPageButton").click();
  await expectRegistryTitle(host, "Список действий");
  await host.locator("textarea[data-registry='actions'][data-row-index='0'][data-key='situation']").fill("Попросить помощи");
  await host.locator("textarea[data-registry='actions'][data-row-index='0'][data-key='adaptiveBehavior']").fill("Спросить прямо");

  await host.locator("#triggersPageButton").click();
  await expectRegistryTitle(host, "Список триггеров");
  await host.locator("textarea[data-registry='triggers'][data-row-index='0'][data-key='situation']").fill("Разговор с незнакомым человеком");
  await host.locator("input[data-registry='triggers'][data-row-index='0'][data-key='difficulty']").fill("45");

  const actions = await readStored(page, STORAGE.actions);
  const triggers = await readStored(page, STORAGE.triggers);
  if (actions.length !== 1 || triggers.length !== 1 || triggers[0].difficulty !== "45") {
    throw new Error(`Registry persistence failed: ${JSON.stringify({ actions, triggers })}`);
  }

  const backupPromise = page.waitForEvent("download");
  await host.locator("#backupButton").click();
  const backupDownload = await backupPromise;
  const backupPath = await backupDownload.path();
  const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
  if (backup.entries.length !== 4 || backup.actionRows.length !== 1 || backup.triggerRows.length !== 1) {
    throw new Error("The JSON backup from the Tilda bundle is incomplete");
  }

  if (pdfOutput) {
    await page.evaluate(() => { window.print = () => {}; });
    await host.locator("#printButton").click();
    await page.waitForFunction(() => document.body.classList.contains("psychological-practices-printing"));
    await page.emulateMedia({ media: "print" });
    await page.pdf({ path: pdfOutput, format: "A4", printBackground: true });
    await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
    await page.emulateMedia({ media: "screen" });
  }

  await page.evaluate(() => {
    const hostElement = document.getElementById("psychological-practices-host");
    const wrapper = document.createElement("section");
    wrapper.id = "simulated-tilda-record";
    hostElement.before(wrapper);
    wrapper.appendChild(hostElement);
    window.__tildaPrintState = null;
    window.print = () => {
      window.__tildaPrintState = {
        bodyClass: document.body.classList.contains("psychological-practices-printing"),
        hostClass: hostElement.classList.contains("printing"),
        mobileClass: hostElement.classList.contains("mobile-print"),
        movedToBody: hostElement.parentNode === document.body,
        hasPrintContent: Boolean(hostElement.shadowRoot.getElementById("printRoot").textContent.trim())
      };
      window.dispatchEvent(new Event("afterprint"));
    };
  });
  await host.locator("#printButton").click();
  await page.waitForFunction(() => window.__tildaPrintState !== null);

  const printResult = await page.evaluate(() => {
    const hostElement = document.getElementById("psychological-practices-host");
    return {
      during: window.__tildaPrintState,
      restoredParent: hostElement.parentElement?.id,
      bodyClassAfter: document.body.classList.contains("psychological-practices-printing"),
      hostClassAfter: hostElement.classList.contains("printing")
    };
  });
  if (
    !printResult.during.bodyClass ||
    !printResult.during.hostClass ||
    !printResult.during.movedToBody ||
    !printResult.during.hasPrintContent ||
    printResult.during.mobileClass ||
    printResult.restoredParent !== "simulated-tilda-record" ||
    printResult.bodyClassAfter ||
    printResult.hostClassAfter
  ) {
    throw new Error(`Tilda print isolation failed: ${JSON.stringify(printResult)}`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await host.locator("#homeButton").click();
  const mobileLayout = await host.evaluate((element) => ({
    hostWidth: element.getBoundingClientRect().width,
    appScrollWidth: element.shadowRoot.querySelector(".app-shell").scrollWidth,
    homeVisible: !element.shadowRoot.getElementById("homeView").classList.contains("hidden")
  }));
  if (!mobileLayout.homeVisible || mobileLayout.appScrollWidth > mobileLayout.hostWidth + 1) {
    throw new Error(`Mobile Tilda layout overflows: ${JSON.stringify(mobileLayout)}`);
  }
  if (screenshotDir) {
    await page.screenshot({ path: path.join(screenshotDir, "tilda-home-mobile.png"), fullPage: true });
  }

  await testLegacyMigration(page, host);
  if (variant === "multi") await testReadableBlockGuards(browser);

  if (errors.length) throw new Error(errors.join("\n"));
  await browser.close();

  console.log(JSON.stringify({
    variant,
    bundleMatchesCopyPaste: true,
    autonomous: true,
    shadowRoot: true,
    globalStylesIsolated: true,
    home: true,
    entries: entries.length,
    actions: actions.length,
    triggers: triggers.length,
    backup: true,
    printIsolation: true,
    mobile: true,
    legacyMigration: true,
    readableBlockGuards: variant === "multi"
  }));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function validateBundleFiles(embedPath, variant) {
  if (!fs.existsSync(embedPath)) {
    throw new Error("Tilda bundle is missing; run build-tilda-embed.cjs first");
  }
  const embed = fs.readFileSync(embedPath, "utf8");
  const sourceFiles = ["index.html", "styles.css", "app.js", "build-tilda-embed.cjs"]
    .map((fileName) => fs.readFileSync(path.join(__dirname, fileName), "utf8"));
  const expectedVersion = crypto.createHash("sha256")
    .update(sourceFiles.join("\n"))
    .digest("hex")
    .slice(0, 12);

  if (variant === "compressed") {
    const copyPaste = fs.readFileSync(path.join(__dirname, "TILDA-COPY-PASTE.txt"), "utf8");
    if (embed !== copyPaste) throw new Error("The copy-paste TXT file does not match tilda-embed.html");
    if (Buffer.byteLength(embed, "utf8") > 90000) {
      throw new Error("The copy-paste bundle is too close to Tilda's T123 size limit");
    }
    if (!embed.includes("DecompressionStream")) {
      throw new Error("The Tilda bundle is not compressed");
    }
  } else {
    const blockNames = [
      "TILDA-BLOCK-1-INTERFACE.txt",
      "TILDA-BLOCK-2-PRACTICES.txt",
      "TILDA-BLOCK-3-APPLICATION.txt"
    ];
    const blocks = blockNames.map((fileName) => fs.readFileSync(path.join(__dirname, fileName), "utf8"));
    const sizes = blocks.map((block) => Buffer.byteLength(block, "utf8"));
    if (sizes.some((size) => size > 90000)) {
      throw new Error(`A readable Tilda block is too large: ${sizes.join(", ")}`);
    }
    if (embed !== blocks.join("\n\n")) {
      throw new Error("The readable Tilda preview does not match its three copy-paste blocks");
    }
    if (blocks.some((block) => block.includes("DecompressionStream") || block.includes("atob("))) {
      throw new Error("A readable Tilda block still contains compressed application data");
    }
    if (!blocks[1].includes("Что может произойти, чтобы чувство стало сильнее?") || !blocks[2].includes("function openHome()")) {
      throw new Error("The readable Tilda blocks do not expose their practice definitions and application logic");
    }
    if (blocks.some((block) => !block.includes(expectedVersion))) {
      throw new Error("The readable Tilda blocks do not share one source version");
    }
  }

  if (/@import|<script[^>]+src=|<link[^>]+stylesheet/i.test(embed)) {
    throw new Error("The Tilda bundle still depends on an external script or stylesheet");
  }
  if (!embed.includes(`data-version="${expectedVersion}"`)) {
    throw new Error("The Tilda bundle is stale; run build-tilda-embed.cjs");
  }
}

async function expectRegistryTitle(host, title) {
  if (await host.locator("#titleField").isVisible()) {
    throw new Error(`The editable entry title is visible in ${title}`);
  }
  if ((await host.locator("#registryTitle").textContent()).trim() !== title) {
    throw new Error(`The registry title is incorrect: ${await host.locator("#registryTitle").textContent()}`);
  }
}

async function readStored(page, key) {
  return page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey) || "[]"), key);
}

async function testLegacyMigration(page, host) {
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("mdpsy.stress-diary.entries.v1", JSON.stringify([{
      id: "legacy-tilda-entry",
      type: "diary",
      title: "Старая запись Tilda",
      date: "2026-07-18",
      tags: "миграция",
      createdAt: "2026-07-18T10:00:00.000Z",
      updatedAt: "2026-07-18T10:00:00.000Z",
      fields: { situation: "Запись из предыдущего Tilda-блока" },
      rationalization: {},
      rationalizationEnabled: false,
      notes: ""
    }]));
    localStorage.setItem("mdpsy.stress-diary.active-id.v1", "legacy-tilda-entry");
  });
  await page.reload();
  await host.locator(".app-shell").waitFor();
  const migrated = await readStored(page, STORAGE.entries);
  if (migrated.length !== 1 || migrated[0].id !== "legacy-tilda-entry") {
    throw new Error(`Legacy Tilda data was not migrated: ${JSON.stringify(migrated)}`);
  }
}

async function testReadableBlockGuards(browser) {
  const interfaceBlock = fs.readFileSync(path.join(__dirname, "TILDA-BLOCK-1-INTERFACE.txt"), "utf8");
  const practicesBlock = fs.readFileSync(path.join(__dirname, "TILDA-BLOCK-2-PRACTICES.txt"), "utf8");
  const applicationBlock = fs.readFileSync(path.join(__dirname, "TILDA-BLOCK-3-APPLICATION.txt"), "utf8");

  const missingBlockPage = await browser.newPage();
  await missingBlockPage.setContent(`${interfaceBlock}\n${applicationBlock}`);
  const missingBlockText = await missingBlockPage.locator("#psychological-practices-host").innerText();
  await missingBlockPage.close();
  if (!missingBlockText.includes("Не найдены все три блока")) {
    throw new Error(`A missing readable block was not explained: ${missingBlockText}`);
  }

  const version = interfaceBlock.match(/data-version="([a-f0-9]{12})"/)?.[1];
  if (!version) throw new Error("Could not read the readable Tilda block version");
  const mismatchedPractices = practicesBlock.replaceAll(version, "000000000000");
  const mismatchPage = await browser.newPage();
  await mismatchPage.setContent(`${interfaceBlock}\n${mismatchedPractices}\n${applicationBlock}`);
  const mismatchText = await mismatchPage.locator("#psychological-practices-host").innerText();
  await mismatchPage.close();
  if (!mismatchText.includes("разным версиям")) {
    throw new Error(`A readable block version mismatch was not explained: ${mismatchText}`);
  }
}

function findBrowserPath() {
  const candidates = [
    process.env.BROWSER_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
  ].filter(Boolean);

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) throw new Error("Chrome or Edge executable was not found");
  return found;
}
