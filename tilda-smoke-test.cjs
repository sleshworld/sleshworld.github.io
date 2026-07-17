const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

(async () => {
  const embedPath = path.join(__dirname, "tilda-embed.html");
  const copyPastePath = path.join(__dirname, "TILDA-COPY-PASTE.txt");
  if (!fs.existsSync(embedPath)) {
    throw new Error("tilda-embed.html is missing; run build-tilda-embed.cjs first");
  }
  if (fs.readFileSync(embedPath, "utf8") !== fs.readFileSync(copyPastePath, "utf8")) {
    throw new Error("The copy-paste TXT file does not match tilda-embed.html");
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: findBrowserPath()
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(pathToFileURL(embedPath).href);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const host = page.locator("#mdpsy-stress-diary-host");
  const app = host.locator(".app-shell");
  await app.waitFor();

  if (process.env.SCREENSHOT_DIR || process.env.PDF_OUTPUT) {
    if (process.env.SCREENSHOT_DIR) fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
    if (process.env.PDF_OUTPUT) fs.mkdirSync(path.dirname(process.env.PDF_OUTPUT), { recursive: true });
    await host.locator("#newActionsButton").click();
    await host.locator("textarea[data-path='fields.situation']").fill("Нужно попросить коллегу помочь с задачей");
    await host.locator("input[data-path='fields.feelings.0.name']").fill("Тревога");
    await host.locator("input[data-path='fields.feelings.0.intensity']").fill("75");
    await host.locator("textarea[data-path='fields.selfDefinition']").fill("Некомпетентным");
    await host.locator("textarea[data-path='fields.protectiveAction']").fill("Долго готовлю формулировку и наблюдаю, занят ли коллега");
    await host.locator("textarea[data-path='fields.avoidantAction']").fill("Откладываю вопрос и переключаюсь на другие задачи");
    await host.locator("textarea[data-path='fields.adaptiveBehavior']").fill("Коротко описать проблему и прямо попросить о помощи");
    if (process.env.SCREENSHOT_DIR) {
      await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "actions-desktop.png") });
      await page.setViewportSize({ width: 390, height: 844 });
      await host.locator(".feeling-row").scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "actions-mobile.png") });
      await page.setViewportSize({ width: 1280, height: 900 });
    }
    if (process.env.PDF_OUTPUT) {
      await page.evaluate(() => { window.print = () => {}; });
      await host.locator("#printButton").click();
      await page.waitForTimeout(120);
      await page.emulateMedia({ media: "print" });
      await page.pdf({ path: process.env.PDF_OUTPUT, format: "A4", printBackground: true });
      await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
      await page.emulateMedia({ media: "screen" });
    }
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await app.waitFor();
  }

  if (!(await host.locator("#newActionsButton").isVisible())) {
    throw new Error("The actions entry button is missing from the Tilda bundle");
  }

  await page.addStyleTag({ content: ".button, input, textarea { display: none !important; }" });
  if (!(await host.locator("#newDiaryButton").isVisible())) {
    throw new Error("Tilda-like global styles leaked into the embedded application");
  }

  await host.locator("#titleInput").fill("Tilda test");
  await host.locator("textarea[data-path='fields.situation']").first().fill("Проверка встроенной формы");
  await host.locator("#tagsInput").fill("tilda, тест");

  const storedEntries = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem("mdpsy.stress-diary.entries.v1") || "[]");
  });
  if (storedEntries.length !== 1 || storedEntries[0].title !== "Tilda test") {
    throw new Error("The embedded application did not save its entry locally");
  }

  const oldStorageUsed = await page.evaluate(() => localStorage.getItem("stress-diary-app.entries.v1"));
  if (oldStorageUsed !== null) {
    throw new Error("The embedded application used the non-namespaced storage key");
  }

  await page.evaluate(() => {
    window.__tildaPrintState = null;
    window.print = () => {
      const hostElement = document.getElementById("mdpsy-stress-diary-host");
      window.__tildaPrintState = {
        body: document.body.classList.contains("mdpsy-diary-printing"),
        host: hostElement.classList.contains("printing")
      };
      window.dispatchEvent(new Event("afterprint"));
    };
  });
  await host.locator("#printButton").click();
  await page.waitForFunction(() => window.__tildaPrintState !== null);

  const printState = await page.evaluate(() => window.__tildaPrintState);
  const cleanedUp = await page.evaluate(() => ({
    body: document.body.classList.contains("mdpsy-diary-printing"),
    host: document.getElementById("mdpsy-stress-diary-host").classList.contains("printing")
  }));
  if (!printState.body || !printState.host || cleanedUp.body || cleanedUp.host) {
    throw new Error(`Print mode failed: ${JSON.stringify({ printState, cleanedUp })}`);
  }

  await browser.close();
  if (errors.length) throw new Error(errors.join("\n"));

  console.log(JSON.stringify({
    embedded: true,
    copyPasteFile: true,
    shadowRoot: true,
    globalStylesIsolated: true,
    storedEntries: storedEntries.length,
    printMode: true
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
  if (!found) throw new Error("Chrome or Edge executable was not found");
  return found;
}
