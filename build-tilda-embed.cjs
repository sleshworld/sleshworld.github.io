const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const projectDir = __dirname;
const sourceHtml = read("index.html");
const sourceCss = read("styles.css");
const sourceJs = read("app.js");
const sourceBuilder = fs.readFileSync(__filename, "utf8");

const appMarkup = extractAppMarkup(sourceHtml);
const shadowCss = createShadowCss(sourceCss);
const embeddedJs = createEmbeddedJs(sourceJs);
const version = createVersion(sourceHtml, sourceCss, sourceJs, sourceBuilder);
const output = createBundle(appMarkup, shadowCss, embeddedJs, version);
const outputSize = Buffer.byteLength(output, "utf8");

fs.writeFileSync(path.join(projectDir, "tilda-embed.html"), output, "utf8");
fs.writeFileSync(path.join(projectDir, "TILDA-COPY-PASTE.txt"), output, "utf8");
console.log(`Created Tilda bundle ${version} in HTML and TXT formats (${outputSize} bytes each)`);

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
    .replace(/:root\s*\{/, ":host {")
    .replace(/body\.([a-z0-9_-]+)/gi, ":host(.$1)")
    .replace(/(^|\n)(\s*)body\s*\{/g, "$1$2:host {");

  result = result.replace(
    /:host\s*\{/,
    ":host {\n  display: block;\n  width: 100%;\n  min-width: 0;\n  isolation: isolate;"
  );

  if (/(^|\n)\s*body(?:\.|\s*\{)/.test(result)) {
    throw new Error("An unscoped body selector remains in Tilda CSS");
  }
  if (result.includes("@import")) {
    throw new Error("An external CSS import remains in the Tilda bundle");
  }
  return result.trim();
}

function createEmbeddedJs(js) {
  const domReadyBlock = `document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  load();
  activeView = "home";
  render();
  bindEvents();
  showStorageIntroIfNeeded();
});`;

  const directInit = `migrateLegacyTildaStorage();
bindElements();
load();
activeView = "home";
render();
bindEvents();
showStorageIntroIfNeeded();`;

  if (!js.includes(domReadyBlock)) {
    throw new Error("Could not replace the DOMContentLoaded initializer");
  }

  let result = js
    .replace(/"stress-diary-app\./g, '"psychological-practices.')
    .replace(domReadyBlock, directInit)
    .replace(/document\.getElementById\(/g, "root.getElementById(")
    .replace(
      'document.body.classList.toggle("home-active", isHome);',
      'host.classList.toggle("home-active", isHome);'
    )
    .replace(
      'document.body.classList.add("printing");',
      'host.classList.add("printing");\n  document.body.classList.add("psychological-practices-printing");\n  prepareTildaPrintHost();'
    )
    .replace(
      'document.body.classList.toggle("mobile-print", window.matchMedia("(max-width: 700px)").matches);',
      'host.classList.toggle("mobile-print", window.matchMedia("(max-width: 700px)").matches);'
    )
    .replace(
      'document.body.classList.remove("printing", "mobile-print");',
      'host.classList.remove("printing", "mobile-print");\n  document.body.classList.remove("psychological-practices-printing");\n  restoreTildaPrintHost();'
    );

  const requiredFragments = [
    "migrateLegacyTildaStorage();",
    'host.classList.toggle("home-active", isHome);',
    'document.body.classList.add("psychological-practices-printing");',
    'document.body.classList.remove("psychological-practices-printing");'
  ];
  for (const fragment of requiredFragments) {
    if (!result.includes(fragment)) throw new Error(`Tilda transform is missing: ${fragment}`);
  }

  if (result.includes("document.getElementById(")) {
    throw new Error("An unscoped getElementById call remains in Tilda JavaScript");
  }
  if (/document\.body\.classList\.(?:add|remove|toggle)\("(?:home-active|printing|mobile-print)"/.test(result)) {
    throw new Error("An application body class remains unscoped in Tilda JavaScript");
  }
  return result.trim();
}

function createBundle(markup, css, js, version) {
  return `<!--
  Психологические практики для Tilda.
  1. Добавьте на отдельную страницу блок T123: Другое -> HTML-код.
  2. Вставьте этот файл целиком и сохраните блок.
  3. Опубликуйте страницу: приложение запускается именно на опубликованной странице.

  Блок автономный: HTML, CSS и JavaScript находятся внутри него. Записи остаются
  в localStorage браузера посетителя и не отправляются автору этого файла.
-->
<style id="psychological-practices-page-styles">
  #psychological-practices-host {
    display: block;
    width: 100%;
    min-width: 0;
    max-width: none;
  }

  @media print {
    body.psychological-practices-printing {
      margin: 0 !important;
      background: #ffffff !important;
    }

    body.psychological-practices-printing > :not(#psychological-practices-host) {
      display: none !important;
    }

    body.psychological-practices-printing #psychological-practices-host {
      position: absolute !important;
      inset: 0 auto auto 0 !important;
      display: block !important;
      width: 100% !important;
      max-width: none !important;
    }
  }
</style>

<div id="psychological-practices-host" data-version="${version}"></div>

<template id="psychological-practices-template">
  <style>
${indent(css, 4)}
  </style>

${indent(markup, 2)}
</template>

<script>
(() => {
  "use strict";

  const host = document.getElementById("psychological-practices-host");
  const template = document.getElementById("psychological-practices-template");
  if (!host || !template || host.shadowRoot) return;

  const root = host.attachShadow({ mode: "open" });
  root.appendChild(template.content.cloneNode(true));
  template.remove();

  let tildaPrintParent = null;
  let tildaPrintNextSibling = null;

  function prepareTildaPrintHost() {
    if (host.parentNode === document.body) return;
    tildaPrintParent = host.parentNode;
    tildaPrintNextSibling = host.nextSibling;
    document.body.appendChild(host);
  }

  function restoreTildaPrintHost() {
    if (!tildaPrintParent) return;
    if (tildaPrintNextSibling && tildaPrintNextSibling.parentNode === tildaPrintParent) {
      tildaPrintParent.insertBefore(host, tildaPrintNextSibling);
    } else {
      tildaPrintParent.appendChild(host);
    }
    tildaPrintParent = null;
    tildaPrintNextSibling = null;
  }

  function migrateLegacyTildaStorage() {
    const legacyEntries = localStorage.getItem("mdpsy.stress-diary.entries.v1");
    const legacyActiveId = localStorage.getItem("mdpsy.stress-diary.active-id.v1");
    if (!localStorage.getItem(STORAGE_KEY) && legacyEntries) {
      localStorage.setItem(STORAGE_KEY, legacyEntries);
    }
    if (!localStorage.getItem(ACTIVE_KEY) && legacyActiveId) {
      localStorage.setItem(ACTIVE_KEY, legacyActiveId);
    }
  }

${indent(js, 2)}
})();
</script>
`;
}

function createVersion(...sources) {
  return crypto.createHash("sha256").update(sources.join("\n")).digest("hex").slice(0, 12);
}

function indent(value, spaces) {
  const prefix = " ".repeat(spaces);
  return String(value).split("\n").map((line) => line ? `${prefix}${line}` : "").join("\n");
}
