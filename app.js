const STORAGE_KEY = "stress-diary-app.entries.v1";
const ACTIVE_KEY = "stress-diary-app.active-id.v1";

const FEELINGS = ["страх", "обида", "вина", "стыд", "тревога", "разочарование", "грусть", "агрессия"];

const TYPE_META = {
  diary: {
    label: "Дневник",
    defaultTitle: "Новый дневник"
  },
  diagnostic: {
    label: "Диагностика",
    defaultTitle: "Новая диагностика"
  },
  actions: {
    label: "Охранительные действия",
    defaultTitle: "Новые действия"
  }
};

const DIAGNOSTIC_SECTIONS = [
  {
    title: "Ситуация",
    index: "1",
    fields: [
      {
        key: "situation",
        label: "Ситуация",
        hint: "Любая ситуация, которая беспокоит сейчас, в прошлом или будущем. Вспомни сам момент возникновения чувства.",
        rows: 5
      },
      {
        key: "bodySensations",
        label: "Чувство в теле и телесные ощущения",
        hint: "От горла до эпигастрии.",
        rows: 3
      },
      {
        key: "feelingIntensity",
        label: "Сила чувства",
        kind: "range"
      },
      {
        key: "feelingName",
        label: "Название чувства",
        rows: 2
      }
    ]
  },
  {
    title: "Усиление",
    index: "2",
    fields: [
      {
        key: "amplification",
        label: "Что может произойти, чтобы чувство стало сильнее?",
        hint: "Можно фантастическое, нелогичное или чрезмерное. Здесь не нужна рациональная проверка.",
        rows: 5
      }
    ]
  },
  {
    title: "Какая я?",
    index: "3",
    fields: [
      {
        key: "selfDefinition",
        label: "Какой я себя чувствую в ситуации с усилением?",
        hint: "Прилагательное без 'не'.",
        rows: 2
      }
    ]
  },
  {
    title: "Еще усиление",
    index: "4",
    fields: [
      {
        key: "amplificationMore",
        label: "Что еще может произойти в ситуации из пункта 2?",
        hint: "Так, чтобы определение из пункта 3 стало сильнее.",
        rows: 4
      }
    ]
  },
  {
    title: "Образ себя и мира",
    index: "5",
    fields: [
      {
        key: "selfDefinitionStronger",
        label: "Какой себя почувствуешь?",
        hint: "Прилагательное без 'не'.",
        rows: 2
      },
      {
        key: "otherDefinitions",
        label: "Какими ты видишь других людей?",
        rows: 3
      },
      {
        key: "worldDefinition",
        label: "Какой мир?",
        rows: 3
      }
    ]
  },
  {
    title: "Кто бы мог усилить?",
    index: "6",
    fields: [
      {
        key: "amplifierPerson",
        label: "Кто может появиться в сцене?",
        hint: "Желательно знакомый до 12 лет. Можно подставить умершего человека как образ в сцене.",
        rows: 3
      },
      {
        key: "amplifierAction",
        label: "Что он, она или они могли бы сказать или сделать?",
        rows: 4
      },
      {
        key: "worseVariant",
        label: "Что было бы хуже?",
        hint: "Никого, толпа незнакомых, знакомые, родственники, учитель, врач или другой вариант.",
        rows: 3
      }
    ]
  },
  {
    title: "Воспоминание",
    index: "7",
    fields: [
      {
        key: "childhoodMemory",
        label: "Воспоминание или я из детства, связанные с этим человеком или толпой",
        hint: "Если не приходит сразу, можно оставить пустым и вернуться позже.",
        rows: 5
      }
    ]
  }
];

const DIARY_SECTIONS = [
  {
    title: "Ситуация",
    index: "1",
    fields: [
      {
        key: "situation",
        label: "Ситуация",
        hint: "Любая ситуация, которая беспокоит сейчас, в прошлом или будущем. Вспомни сам момент возникновения чувства.",
        rows: 5
      }
    ]
  },
  {
    title: "Тело",
    index: "2",
    fields: [
      {
        key: "bodySensations",
        label: "Чувство в теле и телесные ощущения",
        hint: "От горла до эпигастрии.",
        rows: 4
      },
      {
        key: "feelingIntensityBefore",
        label: "Сила чувства",
        kind: "range"
      },
      {
        key: "bodyFeelingName",
        label: "Название чувства",
        rows: 2
      }
    ]
  },
  {
    title: "Основное чувство",
    index: "3",
    fields: [
      {
        key: "coreFeeling",
        label: "Какое чувство возникает?",
        hint: "Выбери одно основное чувство. При панике или страхе смерти: представь, что это уже случилось, а ты призрак.",
        kind: "chips",
        options: FEELINGS
      }
    ]
  },
  {
    title: "Мысли",
    index: "4",
    fields: [
      {
        key: "thoughtsFlow",
        label: "Какие мысли вызывает это чувство?",
        hint: "Весь поток мыслей как цитаты. Если одна мысль типа 'пиздец', спроси: 'и что это для меня значит?'",
        rows: 6
      },
      {
        key: "worstThought",
        label: "Самая неприятная мысль",
        rows: 3
      }
    ]
  },
  {
    title: "Образ себя и мира",
    index: "5",
    fields: [
      {
        key: "selfDefinition",
        label: "Какой себя почувствуешь в ситуации мыслей из пункта 4?",
        rows: 3
      },
      {
        key: "otherDefinitions",
        label: "Какими ты видишь других людей?",
        rows: 3
      },
      {
        key: "worldDefinition",
        label: "Какой мир?",
        rows: 3
      }
    ]
  },
  {
    title: "Поведение",
    index: "6",
    fields: [
      {
        key: "behavior",
        label: "Что я делаю после мыслей в голове?",
        hint: "Сними ситуацию пункта 1 с паузы и посмотри, что начал делать, начал бы делать или уже делаешь, чтобы этого не произошло.",
        rows: 5
      },
      {
        key: "problemSolved",
        label: "Какую проблему решало действие?",
        hint: "Если действие решало не реальную проблему, а облегчало чувство, переходи к рационализации.",
        rows: 3
      }
    ]
  }
];

const ACTION_COLUMNS = [
  {
    key: "situation",
    label: "Ситуация",
    placeholder: "Что происходит или что нужно сделать?"
  },
  {
    key: "feelingsAndSelf",
    label: "Чувство в % + какой я буду",
    placeholder: "Тревога 80%, стыд 50%\nКаким буду: слабым, глупым..."
  },
  {
    key: "protectiveAction",
    label: "Охранительное действие",
    placeholder: "Что делаю, чтобы снизить чувство?"
  },
  {
    key: "avoidantAction",
    label: "Избегающее действие",
    placeholder: "Как избегаю или откладываю?"
  },
  {
    key: "adaptiveBehavior",
    label: "Адаптивное поведение",
    placeholder: "Что сделал бы без чувства?"
  }
];

const RATIONALIZATION_SECTIONS = [
  {
    title: "Проверка мысли",
    index: "7.1-7.3",
    fields: [
      {
        key: "evidenceFor",
        label: "Какие доказательства того, что моя мысль верна?",
        hint: "Мысль из пункта 4 дневника.",
        rows: 4
      },
      {
        key: "evidenceAgainst",
        label: "Какие доказательства того, что моя мысль неверна или не совсем верна?",
        rows: 4
      },
      {
        key: "alternativeView",
        label: "Есть ли другой взгляд и альтернативное объяснение?",
        rows: 4
      }
    ]
  },
  {
    title: "Исходы",
    index: "7.4-7.6",
    fields: [
      {
        key: "worstOutcome",
        label: "Что самое плохое может произойти и смогу ли я справиться? Как справлюсь?",
        rows: 4
      },
      {
        key: "bestOutcome",
        label: "Что самое лучшее может произойти?",
        rows: 3
      },
      {
        key: "realisticOutcome",
        label: "Какой реалистичный результат?",
        rows: 3
      },
      {
        key: "thoughtConsequences",
        label: "Каковы последствия для меня от мыслей из пункта 4 дневника?",
        rows: 4
      }
    ]
  },
  {
    title: "Действие",
    index: "7.7-7.12",
    fields: [
      {
        key: "thinkingChange",
        label: "Что изменится от изменения моего мышления?",
        rows: 3
      },
      {
        key: "friendAdvice",
        label: "Что бы я посоветовал другу в такой же ситуации?",
        rows: 3
      },
      {
        key: "nextAction",
        label: "Что мне надо сделать в этой ситуации?",
        rows: 3
      },
      {
        key: "aiAction",
        label: "Что бы сделал искусственный интеллект в моей ситуации?",
        rows: 3
      },
      {
        key: "withoutFeeling",
        label: "Что бы я сделал, если бы возникшего чувства не было?",
        rows: 3
      },
      {
        key: "feelingIntensityAfter",
        label: "Сила чувства после рационализации",
        kind: "range"
      }
    ]
  }
];

let entries = [];
let activeId = "";
let toastTimer = 0;
let listRenderTimer = 0;
let printCleanupTimer = 0;
let titleBeforePrint = "";

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  load();
  if (entries.length === 0) {
    createEntry("diary", { silent: true });
  }
  render();
  bindEvents();
});

function bindElements() {
  elements.entryList = document.getElementById("entryList");
  elements.searchInput = document.getElementById("searchInput");
  elements.titleInput = document.getElementById("titleInput");
  elements.entryTypeLabel = document.getElementById("entryTypeLabel");
  elements.entryDateInput = document.getElementById("entryDateInput");
  elements.tagsInput = document.getElementById("tagsInput");
  elements.formRoot = document.getElementById("formRoot");
  elements.editorPanel = document.getElementById("editorPanel");
  elements.emptyState = document.getElementById("emptyState");
  elements.toast = document.getElementById("toast");
  elements.printRoot = document.getElementById("printRoot");
  elements.importFileInput = document.getElementById("importFileInput");
}

function bindEvents() {
  document.getElementById("newDiaryButton").addEventListener("click", () => createEntry("diary"));
  document.getElementById("newDiagnosticButton").addEventListener("click", () => createEntry("diagnostic"));
  document.getElementById("newActionsButton").addEventListener("click", () => createEntry("actions"));
  document.getElementById("emptyNewDiaryButton").addEventListener("click", () => createEntry("diary"));
  document.getElementById("emptyNewDiagnosticButton").addEventListener("click", () => createEntry("diagnostic"));
  document.getElementById("emptyNewActionsButton").addEventListener("click", () => createEntry("actions"));
  document.getElementById("duplicateButton").addEventListener("click", duplicateActive);
  document.getElementById("deleteButton").addEventListener("click", deleteActive);
  document.getElementById("copyButton").addEventListener("click", copyActive);
  document.getElementById("downloadMarkdownButton").addEventListener("click", downloadActiveMarkdown);
  document.getElementById("printButton").addEventListener("click", printActive);
  document.getElementById("storagePrintButton").addEventListener("click", printActive);
  document.getElementById("backupButton").addEventListener("click", downloadBackup);
  document.getElementById("importButton").addEventListener("click", () => elements.importFileInput.click());
  elements.importFileInput.addEventListener("change", importBackup);

  elements.searchInput.addEventListener("input", renderList);
  elements.entryList.addEventListener("click", handleEntryListClick);

  elements.titleInput.addEventListener("input", () => {
    const entry = getActiveEntry();
    if (!entry) return;
    entry.title = elements.titleInput.value;
    touchAndSave(entry);
  });

  elements.entryDateInput.addEventListener("input", () => {
    const entry = getActiveEntry();
    if (!entry) return;
    entry.date = elements.entryDateInput.value;
    touchAndSave(entry);
  });

  elements.tagsInput.addEventListener("input", () => {
    const entry = getActiveEntry();
    if (!entry) return;
    entry.tags = elements.tagsInput.value;
    touchAndSave(entry);
  });

  elements.formRoot.addEventListener("input", handleFormInput);
  elements.formRoot.addEventListener("change", handleFormChange);
  elements.formRoot.addEventListener("click", handleFormClick);
  window.addEventListener("afterprint", cleanupPrint);
}

function load() {
  try {
    entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(entries)) entries = [];
  } catch {
    entries = [];
  }
  entries = entries.map(normalizeEntry).filter(shouldPersistEntry);
  activeId = localStorage.getItem(ACTIVE_KEY) || "";
  if (!entries.some((entry) => entry.id === activeId)) {
    activeId = entries[0]?.id || "";
  }
}

function save() {
  const persistedEntries = getPersistedEntries();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedEntries));
  if (persistedEntries.some((entry) => entry.id === activeId)) {
    localStorage.setItem(ACTIVE_KEY, activeId);
  } else {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

function createEntry(type, options = {}) {
  discardEmptyEntries();
  const now = new Date();
  const entry = {
    id: createId(),
    type,
    title: TYPE_META[type].defaultTitle,
    date: toDateInputValue(now),
    tags: "",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    fields: type === "actions" ? { actionRows: [createEmptyActionRow()] } : {},
    rationalization: {},
    rationalizationEnabled: false,
    notes: ""
  };
  entries.unshift(entry);
  activeId = entry.id;
  save();
  render();
  if (!options.silent) {
    showToast("Запись создана");
  }
}

function createEmptyActionRow() {
  return ACTION_COLUMNS.reduce((row, column) => {
    row[column.key] = "";
    return row;
  }, {});
}

function normalizeEntry(entry) {
  const normalized = {
    ...entry,
    fields: entry?.fields && typeof entry.fields === "object" ? entry.fields : {},
    rationalization: entry?.rationalization && typeof entry.rationalization === "object" ? entry.rationalization : {},
    notes: entry?.notes || ""
  };
  if (normalized.type !== "actions") return normalized;
  if (Array.isArray(normalized.fields.actionRows) && normalized.fields.actionRows.length) return normalized;

  const legacyFeelings = hasPrintableValue(normalized.fields.feelingsText)
    ? String(normalized.fields.feelingsText)
    : printValue(normalized.fields.feelings || []);
  const feelingsAndSelf = [
    legacyFeelings,
    normalized.fields.selfDefinition ? `Каким буду: ${normalized.fields.selfDefinition}` : ""
  ].filter(Boolean).join("\n");
  normalized.fields.actionRows = [{
    situation: normalized.fields.situation || "",
    feelingsAndSelf,
    protectiveAction: normalized.fields.protectiveAction || "",
    avoidantAction: normalized.fields.avoidantAction || "",
    adaptiveBehavior: normalized.fields.adaptiveBehavior || ""
  }];
  return normalized;
}

function duplicateActive() {
  const entry = getActiveEntry();
  if (!entry) return;
  if (!shouldPersistEntry(entry)) {
    showToast("Пустую запись дублировать не нужно");
    return;
  }
  const now = new Date().toISOString();
  const copy = JSON.parse(JSON.stringify(entry));
  copy.id = createId();
  copy.title = `${entry.title || TYPE_META[entry.type].defaultTitle} - копия`;
  copy.createdAt = now;
  copy.updatedAt = now;
  entries.unshift(copy);
  activeId = copy.id;
  save();
  render();
  showToast("Копия создана");
}

function deleteActive() {
  const entry = getActiveEntry();
  if (!entry) return;
  const confirmed = window.confirm("Удалить эту запись? Отменить удаление не получится.");
  if (!confirmed) return;
  entries = entries.filter((item) => item.id !== entry.id);
  activeId = entries[0]?.id || "";
  save();
  render();
  showToast("Запись удалена");
}

function render() {
  renderList();
  renderEditor();
}

function renderList() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const sorted = getPersistedEntries().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const filtered = query
    ? sorted.filter((entry) => searchBlob(entry).includes(query))
    : sorted;

  elements.entryList.innerHTML = filtered.length
    ? filtered.map(renderEntryCard).join("")
    : `<p class="hint">${query ? "Ничего не найдено." : "Сохраненных записей пока нет."}</p>`;
}

function renderEntryCard(entry) {
  const title = entry.title || TYPE_META[entry.type].defaultTitle;
  const meta = [
    TYPE_META[entry.type].label,
    formatDate(entry.date),
    entry.tags ? entry.tags : ""
  ].filter(Boolean).join(" · ");
  const activeClass = entry.id === activeId ? " active" : "";
  return `
    <button class="entry-card${activeClass}" type="button" data-entry-id="${escapeAttr(entry.id)}">
      <span class="entry-title">${escapeHTML(title)}</span>
      <span class="entry-meta">${escapeHTML(meta)}</span>
    </button>
  `;
}

function renderEditor() {
  const entry = getActiveEntry();
  const hasEntry = Boolean(entry);
  elements.editorPanel.classList.toggle("hidden", !hasEntry);
  elements.emptyState.classList.toggle("hidden", hasEntry);
  document.querySelector(".topbar").classList.toggle("hidden", !hasEntry);

  if (!entry) return;

  elements.entryTypeLabel.textContent = TYPE_META[entry.type].label;
  elements.titleInput.value = entry.title || TYPE_META[entry.type].defaultTitle;
  elements.entryDateInput.value = entry.date || "";
  elements.tagsInput.value = entry.tags || "";
  const renderers = {
    diary: renderDiary,
    diagnostic: renderDiagnostic,
    actions: renderActions
  };
  elements.formRoot.innerHTML = (renderers[entry.type] || renderDiary)(entry);
}

function renderDiagnostic(entry) {
  const notice = `
    <div class="notice">
      <h2>Важно</h2>
      <ul>
        <li>Создать одну большую картину или сцену.</li>
        <li>Придумывать без страха странности.</li>
        <li>Почувствовать эмоции и чувства, не включать рациональное мышление.</li>
      </ul>
    </div>
  `;
  return notice + DIAGNOSTIC_SECTIONS.map((section) => renderSection(section, entry.fields, "fields")).join("") + renderNotes(entry);
}

function renderDiary(entry) {
  const notice = `
    <div class="notice">
      <h2>Важно</h2>
      <ul>
        <li>Представить момент детально, как картинку или фильм.</li>
        <li>В пункте 3 не спорить с собой и не включать сознательные мысли.</li>
        <li>Выделить одну самую неприятную мысль.</li>
      </ul>
    </div>
  `;
  const diary = DIARY_SECTIONS.map((section) => renderSection(section, entry.fields, "fields")).join("");
  return notice + diary + renderProblemBranch(entry) + renderNotes(entry);
}

function renderActions(entry) {
  const rows = getActionRows(entry);
  return `
    <section class="actions-sheet">
      <div class="actions-sheet-heading">
        <div>
          <h2>Быстрый разбор действий</h2>
          <p class="hint">Одна ситуация - одна строка. Можно заполнять короткими фразами.</p>
        </div>
        <span class="action-row-count">Строк: ${rows.length}</span>
      </div>
      <div class="actions-table" role="table" aria-label="Охранительные и избегающие действия">
        <div class="actions-table-head" role="row">
          ${ACTION_COLUMNS.map((column) => `<div role="columnheader">${escapeHTML(column.label)}</div>`).join("")}
          <span aria-hidden="true"></span>
        </div>
        <div class="actions-table-body">
          ${rows.map((row, index) => renderActionRow(row, index, rows.length)).join("")}
        </div>
      </div>
      <button class="button add-action-row" type="button" data-add-action-row>Добавить строку</button>
    </section>
    ${renderCompactNotes(entry)}
  `;
}

function renderActionRow(row, index, rowCount) {
  return `
    <div class="action-table-row" role="row">
      ${ACTION_COLUMNS.map((column) => `
        <label class="action-table-cell" role="cell">
          <span class="action-cell-label">${escapeHTML(column.label)}</span>
          <textarea rows="2" data-path="fields.actionRows.${index}.${escapeAttr(column.key)}" placeholder="${escapeAttr(column.placeholder)}">${escapeHTML(row?.[column.key] || "")}</textarea>
        </label>
      `).join("")}
      <button class="icon-button remove-action-row" type="button" data-remove-action-row="${index}" title="Удалить строку" aria-label="Удалить строку ${index + 1}" ${rowCount === 1 ? "disabled" : ""}>&times;</button>
    </div>
  `;
}

function getActionRows(entry) {
  const rows = entry?.fields?.actionRows;
  return Array.isArray(rows) && rows.length ? rows : [createEmptyActionRow()];
}

function renderCompactNotes(entry) {
  return `
    <details class="compact-notes" ${hasPrintableValue(entry.notes) ? "open" : ""}>
      <summary>
        <span>Заметки</span>
        <small>необязательно</small>
      </summary>
      <label class="field">
        <span>Впечатления и инсайты</span>
        <textarea rows="4" data-path="notes" placeholder="Что хочется запомнить или обсудить с психологом?">${escapeHTML(entry.notes || "")}</textarea>
      </label>
    </details>
  `;
}

function renderNotes(entry) {
  return `
    <section class="section">
      <div class="section-header">
        <h2>Заметки</h2>
        <span class="step-index">после</span>
      </div>
      <label class="field">
        <span>Впечатления и инсайты после заполнения</span>
        <p class="hint">Что стало понятнее, что хочется запомнить, что обсудить с психологом.</p>
        <textarea rows="6" data-path="notes">${escapeHTML(entry.notes || "")}</textarea>
      </label>
    </section>
  `;
}

function renderProblemBranch(entry) {
  const value = entry.fields.realProblemSolved || "";
  const shouldShowRationalization = entry.rationalizationEnabled || value === "no";
  const radio = `
    <section class="section">
      <div class="section-header">
        <h2>Переход к рационализации</h2>
        <span class="step-index">после пункта 6</span>
      </div>
      <div class="branch-box">
        <div>
          <p class="field-label">Действие из пункта 6 решало реальную проблему?</p>
          <p class="hint">Если действие главным образом облегчало чувство, рационализация обычно нужна.</p>
        </div>
        <div class="radio-grid">
          ${renderRadio("fields.realProblemSolved", "yes", "Да", value)}
          ${renderRadio("fields.realProblemSolved", "no", "Нет", value)}
          ${renderRadio("fields.realProblemSolved", "unclear", "Неясно", value)}
        </div>
        <label class="switch-row">
          <input type="checkbox" data-path="rationalizationEnabled" ${entry.rationalizationEnabled ? "checked" : ""}>
          <span>Показать рационализацию</span>
        </label>
      </div>
    </section>
  `;

  if (!shouldShowRationalization) return radio;

  const thought = entry.fields.worstThought || "";
  const thoughtBox = thought
    ? `<div class="notice"><h2>Мысль для проверки</h2><p>${escapeHTML(thought)}</p></div>`
    : "";
  const rationalization = RATIONALIZATION_SECTIONS
    .map((section) => renderSection(section, entry.rationalization, "rationalization"))
    .join("");
  return radio + thoughtBox + rationalization;
}

function renderSection(section, values, rootPath) {
  return `
    <section class="section">
      <div class="section-header">
        <h2>${escapeHTML(section.title)}</h2>
        <span class="step-index">${escapeHTML(section.index)}</span>
      </div>
      <div class="field-grid">
        ${section.fields.map((field) => renderField(field, values[field.key], `${rootPath}.${field.key}`)).join("")}
      </div>
    </section>
  `;
}

function renderField(field, value = "", path) {
  if (field.kind === "range") {
    const numberValue = value === undefined || value === "" || Number.isNaN(Number(value)) ? 50 : Number(value);
    return `
      <label class="field">
        <span>${escapeHTML(field.label)}</span>
        ${field.hint ? `<p class="hint">${escapeHTML(field.hint)}</p>` : ""}
        <div class="range-row">
          <input type="range" min="0" max="100" step="1" value="${numberValue}" data-path="${escapeAttr(path)}">
          <output class="range-value">${numberValue}%</output>
        </div>
      </label>
    `;
  }

  if (field.kind === "chips") {
    const current = String(value || "");
    const chips = field.options.map((option) => `
      <button class="chip" type="button" data-chip-path="${escapeAttr(path)}" data-chip-value="${escapeAttr(option)}" aria-pressed="${current === option ? "true" : "false"}">
        ${escapeHTML(option)}
      </button>
    `).join("");
    return `
      <div class="field">
        <span>${escapeHTML(field.label)}</span>
        ${field.hint ? `<p class="hint">${escapeHTML(field.hint)}</p>` : ""}
        <div class="chips">${chips}</div>
        <input type="text" value="${escapeAttr(current)}" data-path="${escapeAttr(path)}" autocomplete="off" placeholder="Другое чувство">
      </div>
    `;
  }

  return `
    <label class="field">
      <span>${escapeHTML(field.label)}</span>
      ${field.hint ? `<p class="hint">${escapeHTML(field.hint)}</p>` : ""}
      <textarea rows="${field.rows || 4}" data-path="${escapeAttr(path)}">${escapeHTML(value || "")}</textarea>
    </label>
  `;
}

function renderRadio(path, value, label, current) {
  const id = `${path}-${value}`.replace(/[^a-z0-9_-]/gi, "-");
  return `
    <label class="radio-card" for="${escapeAttr(id)}">
      <input id="${escapeAttr(id)}" type="radio" name="${escapeAttr(path)}" value="${escapeAttr(value)}" data-path="${escapeAttr(path)}" ${current === value ? "checked" : ""}>
      <span>${escapeHTML(label)}</span>
    </label>
  `;
}

function handleEntryListClick(event) {
  const card = event.target.closest("[data-entry-id]");
  if (!card) return;
  activeId = card.dataset.entryId;
  save();
  render();
}

function handleFormInput(event) {
  const control = event.target.closest("[data-path]");
  if (!control) return;
  const entry = getActiveEntry();
  if (!entry) return;

  ensureActionRows(entry, control.dataset.path);
  setPath(entry, control.dataset.path, getControlValue(control));
  if (control.type === "range") {
    const output = control.parentElement.querySelector("output");
    if (output) output.textContent = `${control.value}%`;
  }
  touchAndSave(entry);
}

function handleFormChange(event) {
  const control = event.target.closest("[data-path]");
  if (!control) return;
  const entry = getActiveEntry();
  if (!entry) return;

  ensureActionRows(entry, control.dataset.path);
  setPath(entry, control.dataset.path, getControlValue(control));
  touchAndSave(entry);

  if (control.type === "radio" || control.type === "checkbox") {
    renderEditorPreservingViewport();
  }
}

function handleFormClick(event) {
  const addActionRow = event.target.closest("[data-add-action-row]");
  const removeActionRow = event.target.closest("[data-remove-action-row]");
  if (addActionRow || removeActionRow) {
    const entry = getActiveEntry();
    if (!entry) return;
    ensureActionRows(entry, "fields.actionRows.0.situation");
    if (addActionRow) {
      entry.fields.actionRows.push(createEmptyActionRow());
    } else {
      const index = Number(removeActionRow.dataset.removeActionRow);
      if (Number.isInteger(index) && entry.fields.actionRows.length > 1) {
        entry.fields.actionRows.splice(index, 1);
      }
    }
    touchAndSave(entry);
    renderEditorPreservingViewport();
    return;
  }

  const chip = event.target.closest("[data-chip-path]");
  if (!chip) return;
  const entry = getActiveEntry();
  if (!entry) return;
  setPath(entry, chip.dataset.chipPath, chip.dataset.chipValue);
  touchAndSave(entry);
  renderEditor();
}

function ensureActionRows(entry, path) {
  if (!String(path || "").startsWith("fields.actionRows.")) return;
  if (!entry.fields || typeof entry.fields !== "object") entry.fields = {};
  if (!Array.isArray(entry.fields.actionRows)) {
    entry.fields.actionRows = [createEmptyActionRow()];
  }
  const match = String(path).match(/^fields\.actionRows\.(\d+)\./);
  const index = match ? Number(match[1]) : 0;
  while (entry.fields.actionRows.length <= index) {
    entry.fields.actionRows.push(createEmptyActionRow());
  }
}

function renderEditorPreservingViewport() {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  renderEditor();
  window.scrollTo(scrollX, scrollY);
  window.requestAnimationFrame(() => {
    window.scrollTo(scrollX, scrollY);
  });
}

function getControlValue(control) {
  if (control.type === "checkbox") return control.checked;
  if (control.type === "range") return Number(control.value);
  return control.value;
}

function setPath(target, path, value) {
  const parts = path.split(".");
  let current = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (typeof current[part] !== "object" || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

function touchAndSave(entry) {
  entry.updatedAt = new Date().toISOString();
  save();
  scheduleListRender();
}

function scheduleListRender() {
  window.clearTimeout(listRenderTimer);
  listRenderTimer = window.setTimeout(renderList, 180);
}

function copyActive() {
  const entry = getActiveEntry();
  if (!entry) return;
  const text = formatEntryMarkdown(entry);
  copyText(text)
    .then(() => showToast("Запись скопирована"))
    .catch(() => showToast("Не удалось скопировать"));
}

function downloadActiveMarkdown() {
  const entry = getActiveEntry();
  if (!entry) return;
  const fileName = `${formatExportBaseName(entry)}.md`;
  downloadBlob(formatEntryMarkdown(entry), fileName, "text/markdown;charset=utf-8");
}

function printActive() {
  const entry = getActiveEntry();
  if (!entry) return;
  if (!shouldPersistEntry(entry)) {
    showToast("Сначала заполни хотя бы одно поле");
    return;
  }
  elements.printRoot.innerHTML = renderPrintEntry(entry);
  document.body.classList.add("printing");
  titleBeforePrint = document.title;
  document.title = formatExportBaseName(entry);
  showToast("В диалоге печати выбери 'Сохранить как PDF'");
  window.clearTimeout(printCleanupTimer);
  window.setTimeout(() => {
    window.print();
    printCleanupTimer = window.setTimeout(cleanupPrint, 120000);
  }, 60);
}

function cleanupPrint() {
  window.clearTimeout(printCleanupTimer);
  document.body.classList.remove("printing");
  elements.printRoot.innerHTML = "";
  if (titleBeforePrint) {
    document.title = titleBeforePrint;
    titleBeforePrint = "";
  }
}

function downloadBackup() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: getPersistedEntries()
  };
  const date = toDateInputValue(new Date());
  downloadBlob(JSON.stringify(payload, null, 2), `stress-diary-backup-${date}.json`, "application/json;charset=utf-8");
}

function importBackup(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || ""));
      const importedEntries = Array.isArray(parsed) ? parsed : parsed.entries;
      if (!Array.isArray(importedEntries)) throw new Error("No entries");
      const existingIds = new Set(entries.map((entry) => entry.id));
      const normalized = importedEntries.map((entry) => normalizeEntry({
        ...entry,
        id: existingIds.has(entry.id) ? createId() : entry.id || createId(),
        fields: entry.fields || {},
        rationalization: entry.rationalization || {},
        notes: entry.notes || ""
      }));
      const persistedImported = normalized.filter(shouldPersistEntry);
      entries = [...persistedImported, ...entries].filter(shouldPersistEntry);
      activeId = persistedImported[0]?.id || entries[0]?.id || "";
      save();
      render();
      showToast("Импорт завершен");
    } catch {
      showToast("Не удалось импортировать JSON");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function formatEntryMarkdown(entry) {
  const lines = [];
  lines.push(`# ${entry.title || TYPE_META[entry.type].defaultTitle}`);
  lines.push("");
  lines.push(`Тип: ${TYPE_META[entry.type].label}`);
  if (entry.date) lines.push(`Дата ситуации: ${formatDate(entry.date)}`);
  if (entry.tags) lines.push(`Теги: ${entry.tags}`);
  lines.push("");

  if (entry.type === "actions") {
    appendActionRowsMarkdown(lines, getActionRows(entry));
  } else {
    appendSectionsMarkdown(lines, getSectionsForEntry(entry), entry.fields);
  }

  if (entry.type === "diary") {
    const decision = entry.fields.realProblemSolved;
    if (decision) {
      lines.push("## Переход к рационализации");
      lines.push("");
      lines.push(`Действие решало реальную проблему: ${decisionLabel(decision)}`);
      lines.push("");
    }
    if (entry.rationalizationEnabled || decision === "no") {
      appendSectionsMarkdown(lines, RATIONALIZATION_SECTIONS, entry.rationalization);
    }
  }
  appendNotesMarkdown(lines, entry);

  return lines.join("\n").trim() + "\n";
}

function appendSectionsMarkdown(lines, sections, values) {
  sections.forEach((section) => {
    lines.push(`## ${section.index}. ${section.title}`);
    lines.push("");
    section.fields.forEach((field) => {
      const value = values[field.key];
      lines.push(`**${field.label}**`);
      lines.push("");
      lines.push(value === undefined || value === "" ? "-" : printValue(value));
      lines.push("");
    });
  });
}

function appendNotesMarkdown(lines, entry) {
  if (!hasPrintableValue(entry.notes)) return;
  lines.push("## Заметки");
  lines.push("");
  lines.push("**Впечатления и инсайты после заполнения**");
  lines.push("");
  lines.push(String(entry.notes));
  lines.push("");
}

function appendActionRowsMarkdown(lines, rows) {
  rows.filter(hasPrintableValue).forEach((row, index) => {
    lines.push(`## Строка ${index + 1}`);
    lines.push("");
    ACTION_COLUMNS.forEach((column) => {
      lines.push(`**${column.label}**`);
      lines.push("");
      lines.push(hasPrintableValue(row[column.key]) ? String(row[column.key]) : "-");
      lines.push("");
    });
  });
}

function getSectionsForEntry(entry) {
  if (entry.type === "diagnostic") return DIAGNOSTIC_SECTIONS;
  return DIARY_SECTIONS;
}

function renderPrintEntry(entry) {
  const body = entry.type === "actions"
    ? renderPrintActionRows(getActionRows(entry))
    : renderPrintSections(getSectionsForEntry(entry), entry.fields);
  const rationalization = entry.type === "diary" && (entry.rationalizationEnabled || entry.fields.realProblemSolved === "no")
    ? renderPrintSections(RATIONALIZATION_SECTIONS, entry.rationalization)
    : "";
  const notes = renderPrintNotes(entry);
  const decision = entry.type === "diary" && entry.fields.realProblemSolved
    ? `
      <section class="print-section print-decision">
        <div class="print-section-header">
          <span class="print-step">после пункта 6</span>
          <h2>Переход к рационализации</h2>
        </div>
        <div class="print-field">
          <div class="print-field-label">Действие решало реальную проблему?</div>
          <div class="print-field-value">${escapeHTML(decisionLabel(entry.fields.realProblemSolved))}</div>
        </div>
      </section>
    `
    : "";
  const tags = String(entry.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
  const emptyNote = `<p class="print-note">Пустые поля скрыты, чтобы экспорт оставался коротким и читабельным.</p>`;
  return `
    <article class="print-entry">
      <header class="print-cover">
        <div class="print-cover-top">
          <span class="print-kicker">Стресс-дневник</span>
          <span class="print-type">${escapeHTML(TYPE_META[entry.type].label)}</span>
        </div>
        <h1>${escapeHTML(entry.title || TYPE_META[entry.type].defaultTitle)}</h1>
        <div class="print-meta">
          <div class="print-meta-item">
            <span>Тип</span>
            <strong>${escapeHTML(TYPE_META[entry.type].label)}</strong>
          </div>
          ${entry.date ? `
            <div class="print-meta-item">
              <span>Дата ситуации</span>
              <strong>${escapeHTML(formatDate(entry.date))}</strong>
            </div>
          ` : ""}
          <div class="print-meta-item">
            <span>Экспорт</span>
            <strong>${escapeHTML(formatDate(toDateInputValue(new Date())))}</strong>
          </div>
        </div>
        ${tags.length ? `<div class="print-tags">${tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}</div>` : ""}
      </header>
      ${emptyNote}
      ${body}
      ${decision}
      ${rationalization}
      ${notes}
    </article>
  `;
}

function renderPrintNotes(entry) {
  if (!hasPrintableValue(entry.notes)) return "";
  return `
    <section class="print-section">
      <div class="print-section-header">
        <span class="print-step">после</span>
        <h2>Заметки</h2>
      </div>
      <div class="print-field">
        <div class="print-field-label">Впечатления и инсайты после заполнения</div>
        <div class="print-field-value">${escapeHTML(printValue(entry.notes))}</div>
      </div>
    </section>
  `;
}

function renderPrintSections(sections, values) {
  return sections.map((section) => {
    const fields = section.fields
      .map((field) => ({ field, value: values[field.key] }))
      .filter(({ value }) => hasPrintableValue(value));

    if (fields.length === 0) return "";

    return `
      <section class="print-section">
        <div class="print-section-header">
          <span class="print-step">${escapeHTML(section.index)}</span>
          <h2>${escapeHTML(section.title)}</h2>
        </div>
        <div class="print-fields">
          ${fields.map(({ field, value }) => `
            <div class="print-field">
              <div class="print-field-label">${escapeHTML(field.label)}</div>
              <div class="print-field-value">${escapeHTML(printValue(value))}</div>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function renderPrintActionRows(rows) {
  return rows.filter(hasPrintableValue).map((row, index) => {
    const fields = ACTION_COLUMNS
      .map((column) => ({ column, value: row[column.key] }))
      .filter(({ value }) => hasPrintableValue(value));
    return `
      <section class="print-section">
        <div class="print-section-header">
          <span class="print-step">${index + 1}</span>
          <h2>Строка действий</h2>
        </div>
        <div class="print-fields">
          ${fields.map(({ column, value }) => `
            <div class="print-field">
              <div class="print-field-label">${escapeHTML(column.label)}</div>
              <div class="print-field-value">${escapeHTML(String(value))}</div>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function printValue(value) {
  if (Array.isArray(value)) {
    return value
      .filter(hasPrintableValue)
      .map((item) => {
        if (item && typeof item === "object" && ("name" in item || "intensity" in item)) {
          const name = String(item.name || "Чувство без названия").trim();
          const hasIntensity = item.intensity !== null && item.intensity !== undefined && item.intensity !== "" && Number.isFinite(Number(item.intensity));
          const intensity = hasIntensity ? ` - ${Number(item.intensity)}%` : "";
          return `${name}${intensity}`;
        }
        return printValue(item);
      })
      .join("\n");
  }
  if (typeof value === "number") return `${value}%`;
  if (typeof value === "boolean") return value ? "да" : "нет";
  return String(value);
}

function hasPrintableValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.some(hasPrintableValue);
  if (typeof value === "object") return Object.values(value).some(hasPrintableValue);
  return false;
}

function decisionLabel(value) {
  const labels = {
    yes: "да",
    no: "нет",
    unclear: "неясно"
  };
  return labels[value] || value;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function downloadBlob(content, fileName, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getActiveEntry() {
  return entries.find((entry) => entry.id === activeId) || null;
}

function searchBlob(entry) {
  return [
    entry.title,
    entry.date,
    entry.tags,
    TYPE_META[entry.type].label,
    entry.notes,
    ...Object.values(entry.fields || {}),
    ...Object.values(entry.rationalization || {})
  ].map(searchValue).join(" ").toLowerCase();
}

function searchValue(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(searchValue).join(" ");
  if (typeof value === "object") return Object.values(value).map(searchValue).join(" ");
  return String(value);
}

function getPersistedEntries() {
  return entries.filter(shouldPersistEntry);
}

function shouldPersistEntry(entry) {
  if (!entry) return false;
  const defaultTitle = TYPE_META[entry.type]?.defaultTitle || "";
  const hasCustomTitle = Boolean(String(entry.title || "").trim()) && entry.title !== defaultTitle;
  return Boolean(
    hasCustomTitle ||
    String(entry.tags || "").trim() ||
    hasMeaningfulValue(entry.notes) ||
    hasMeaningfulValue(entry.fields) ||
    hasMeaningfulValue(entry.rationalization) ||
    entry.rationalizationEnabled
  );
}

function hasMeaningfulValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.some(hasMeaningfulValue);
  if (typeof value === "object") return Object.values(value).some(hasMeaningfulValue);
  return false;
}

function discardEmptyEntries() {
  const before = entries.length;
  entries = entries.filter(shouldPersistEntry);
  if (!entries.some((entry) => entry.id === activeId)) {
    activeId = entries[0]?.id || "";
  }
  if (entries.length !== before) {
    save();
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("visible");
  }, 1800);
}

function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function formatExportBaseName(entry) {
  const type = TYPE_META[entry.type]?.label || "Запись";
  const date = formatFileDate(entry.date);
  const name = sanitizeFilePart(entry.tags || entry.title || TYPE_META[entry.type]?.defaultTitle || "");
  return [type, date, name].filter(Boolean).join("_");
}

function formatFileDate(value) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  if (Number.isNaN(date.getTime())) return sanitizeFilePart(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}_${month}_${year}`;
}

function sanitizeFilePart(value) {
  return String(value || "")
    .trim()
    .replace(/[#]+/g, "")
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/[;,]+/g, " ")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function slugify(value) {
  const fallback = "stress-diary-entry";
  const slug = String(value)
    .toLowerCase()
    .trim()
    .replace(/ё/g, "e")
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHTML(value);
}
