const fs = require("fs");
const path = require("path");

const projectDir = __dirname;
const sourceHtml = read("index.html");
const sourceCss = read("styles.css");
const sourceJs = read("app.js");

const appMarkup = extractAppMarkup(sourceHtml);
const shadowCss = createShadowCss(sourceCss);
const embeddedJs = createEmbeddedJs(sourceJs);
const output = createBundle(appMarkup, shadowCss, embeddedJs);
const outputSize = Buffer.byteLength(output, "utf8");

fs.writeFileSync(path.join(projectDir, "tilda-embed.html"), output, "utf8");
fs.writeFileSync(path.join(projectDir, "TILDA-COPY-PASTE.txt"), output, "utf8");
console.log(`Created Tilda bundle in HTML and TXT formats (${outputSize} bytes each)`);

function read(fileName) {
  return fs.readFileSync(path.join(projectDir, fileName), "utf8");
}

function extractAppMarkup(html) {
  const body = html.match(/<body>([\s\S]*?)<script\s+src="app\.js"\s+defer><\/script>[\s\S]*?<\/body>/i);
  if (!body) throw new Error("Could not extract application markup from index.html");
  return body[1].trim();
}

function createShadowCss(css) {
  let result = css
    .replace(/^@import[^\n]*\n\n?/, "")
    .replace(/Manrope, Arial, sans-serif/g, '"Segoe UI", Arial, sans-serif')
    .replace(/:root\s*\{/, ":host {")
    .replace(/body\.printing/g, ":host(.printing)")
    .replace(/(^|\n)(\s*)body\s*\{/g, "$1$2:host {");

  result = result.replace(
    /:host\s*\{/,
    ":host {\n  display: block;\n  width: 100%;\n  min-width: 320px;\n  isolation: isolate;"
  );

  if (/(^|\n)\s*body(?:\.|\s*\{)/.test(result)) {
    throw new Error("An unscoped body selector remains in Tilda CSS");
  }
  return result.trim();
}

function createEmbeddedJs(js) {
  const domReadyBlock = `document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  load();
  if (entries.length === 0) {
    createEntry("diary", { silent: true });
  }
  render();
  bindEvents();
});`;

  const directInit = `bindElements();
load();
if (entries.length === 0) {
  createEntry("diary", { silent: true });
}
render();
bindEvents();`;

  if (!js.includes(domReadyBlock)) {
    throw new Error("Could not replace the DOMContentLoaded initializer");
  }

  let result = js
    .replace('const STORAGE_KEY = "stress-diary-app.entries.v1";', 'const STORAGE_KEY = "mdpsy.stress-diary.entries.v1";')
    .replace('const ACTIVE_KEY = "stress-diary-app.active-id.v1";', 'const ACTIVE_KEY = "mdpsy.stress-diary.active-id.v1";')
    .replace(domReadyBlock, directInit)
    .replace(/document\.getElementById\(/g, "root.getElementById(")
    .replace('document.querySelector(".topbar")', 'root.querySelector(".topbar")')
    .replace(
      'document.body.classList.add("printing");',
      'host.classList.add("printing");\n  document.body.classList.add("mdpsy-diary-printing");'
    )
    .replace(
      'document.body.classList.remove("printing");',
      'host.classList.remove("printing");\n  document.body.classList.remove("mdpsy-diary-printing");'
    );

  if (result.includes("document.getElementById(")) {
    throw new Error("An unscoped getElementById call remains in Tilda JavaScript");
  }
  return result.trim();
}

function createBundle(markup, css, js) {
  return `<!--
  Стресс-дневник для Tilda.
  Вставьте этот файл целиком в блок T123 (Другое -> Embed HTML Code),
  сохраните блок и опубликуйте страницу. В редакторе Tilda код может
  отображаться как текст; приложение начинает работать после публикации.
-->
<style id="mdpsy-diary-page-styles">
  #mdpsy-stress-diary-host {
    display: block;
    width: 100%;
    min-width: 0;
  }

  @media print {
    body.mdpsy-diary-printing * {
      visibility: hidden !important;
    }

    body.mdpsy-diary-printing #mdpsy-stress-diary-host {
      position: absolute !important;
      inset: 0 auto auto 0 !important;
      display: block !important;
      width: 100% !important;
      visibility: visible !important;
    }
  }
</style>

<div id="mdpsy-stress-diary-host" data-version="1.0.0"></div>

<template id="mdpsy-stress-diary-template">
  <style>
${indent(css, 4)}
  </style>

${indent(markup, 2)}
</template>

<script>
(() => {
  "use strict";

  const host = document.getElementById("mdpsy-stress-diary-host");
  const template = document.getElementById("mdpsy-stress-diary-template");
  if (!host || !template || host.shadowRoot) return;

  const root = host.attachShadow({ mode: "open" });
  root.appendChild(template.content.cloneNode(true));
  template.remove();

${indent(js, 2)}
})();
</script>
`;
}

function indent(value, spaces) {
  const prefix = " ".repeat(spaces);
  return String(value).split("\n").map((line) => `${prefix}${line}`).join("\n");
}
