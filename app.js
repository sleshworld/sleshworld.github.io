const STORAGE_KEY = "stress-diary-app.entries.v1";
const ACTIVE_KEY = "stress-diary-app.active-id.v1";
const ACTIONS_STORAGE_KEY = "stress-diary-app.action-rows.v1";
const TRIGGERS_STORAGE_KEY = "stress-diary-app.trigger-rows.v1";
const VIEW_STORAGE_KEY = "stress-diary-app.active-view.v1";

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
  scenario: {
    label: "Сценарий",
    defaultTitle: "Новый сценарий"
  },
  report: {
    label: "Отчёт",
    defaultTitle: "Новый отчёт"
  },
  actions: {
    label: "Охранительные действия",
    defaultTitle: "Новые действия"
  }
};

const REGISTRY_META = {
  actions: {
    label: "Действия",
    title: "Список действий",
    fileName: "Список_действий"
  },
  triggers: {
    label: "Триггеры",
    title: "Список триггеров",
    fileName: "Список_триггеров"
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

const SCENARIO_SECTIONS = [
  {
    title: "Задача и безопасность",
    index: "01",
    tone: "coral",
    fields: [
      {
        key: "purpose",
        label: "Зачем я это делаю?",
        hint: "Какую реальную задачу решаю и чему хочу научить мозг?",
        rows: 3
      },
      {
        key: "triggerSituation",
        label: "Какой триггер или ситуация?",
        hint: "Опиши конкретно, без общей формулировки.",
        rows: 4
      },
      {
        key: "safetyRationale",
        label: "Почему это страшно, но безопасно?",
        hint: "Отдели чувство опасности от реального риска.",
        rows: 4
      },
      {
        key: "stopConditions",
        label: "При каких реальных условиях я остановлюсь?",
        hint: "Только объективные границы безопасности, не сила чувства.",
        rows: 3
      },
      {
        key: "expectedFeeling",
        label: "Какое чувство ожидаю?",
        rows: 2
      },
      {
        key: "expectedIntensity",
        label: "Ожидаемая сила чувства",
        kind: "range"
      }
    ]
  },
  {
    title: "Координаты",
    index: "02",
    tone: "yellow",
    fields: [
      {
        key: "plannedTime",
        label: "Во сколько начинаю?",
        kind: "time"
      },
      {
        key: "place",
        label: "Где это происходит?",
        rows: 2
      },
      {
        key: "minimumDuration",
        label: "Минимальная длительность",
        kind: "number",
        min: 1,
        suffix: "мин"
      },
      {
        key: "preparation",
        label: "Что подготовлю заранее?",
        hint: "Только то, что нужно для задачи, а не для успокоения чувства.",
        rows: 3
      }
    ]
  },
  {
    title: "Маршрут",
    index: "03",
    tone: "blue",
    fields: [
      {
        key: "steps",
        label: "Что я буду делать шаг за шагом?",
        hint: "Один наблюдаемый шаг на строку: действие, фраза, ожидание, переход.",
        kind: "ordered-list"
      }
    ]
  },
  {
    title: "Без спасения от чувства",
    index: "04",
    tone: "ink",
    fields: [
      {
        key: "noDoActions",
        label: "Что я НЕ буду делать?",
        hint: "Телефон, оправдания, спешка, избегание взгляда и любые микро-побеги.",
        kind: "checklist"
      }
    ]
  },
  {
    title: "Как проживаю чувство",
    index: "05",
    tone: "mint",
    fields: [
      {
        key: "bodyFocus",
        label: "На каких телесных ощущениях удерживаю внимание?",
        hint: "Что наблюдаю во время сканера вместо внутренних успокоений?",
        rows: 4
      },
      {
        key: "physicalAmplification",
        label: "Как физически усилю реакцию?",
        hint: "Только телесным действием, без усиления фантазией и мыслями.",
        rows: 3
      },
      {
        key: "endingAction",
        label: "Как рационально завершу ситуацию?",
        rows: 3
      },
      {
        key: "completionCriteria",
        label: "Когда сценарий считается выполненным?",
        hint: "Критерий поведения и времени, а не обязательное снижение чувства до нуля.",
        rows: 3
      }
    ]
  }
];

const REPORT_SECTIONS = [
  {
    title: "Как всё происходило",
    index: "01",
    fields: [
      {
        key: "reportDate",
        label: "Когда выполнил сценарий?",
        kind: "date"
      },
      {
        key: "planChanges",
        label: "Что изменилось относительно плана?",
        hint: "Погода, место, одежда, время и другие фактические изменения.",
        rows: 4
      },
      {
        key: "actualEvents",
        label: "Хронология прохождения",
        hint: "Один эпизод на строку: что сделал, что почувствовал, что произошло дальше.",
        kind: "ordered-list"
      },
      {
        key: "actualDuration",
        label: "Сколько длилось?",
        kind: "number",
        min: 1,
        suffix: "мин"
      }
    ]
  },
  {
    title: "Динамика чувства",
    index: "02",
    fields: [
      { key: "feelingBefore", label: "До начала", kind: "range" },
      { key: "feelingPeak", label: "На пике", kind: "range" },
      { key: "feelingAfter", label: "В конце", kind: "range" },
      {
        key: "bodySensations",
        label: "Что происходило в теле и как я это усиливал?",
        rows: 4
      }
    ]
  },
  {
    title: "Охранительное и избегающее поведение",
    index: "03",
    fields: [
      {
        key: "avoidedActions",
        label: "Что удалось НЕ делать?",
        rows: 4
      },
      {
        key: "escapeSlips",
        label: "Какие микро-побеги всё-таки появились?",
        hint: "Без самокритики: телефон, спешка, оправдание, закрытая поза, заполнение пауз.",
        rows: 4
      }
    ]
  },
  {
    title: "Факты и вывод",
    index: "04",
    fields: [
      {
        key: "observedFacts",
        label: "Что реально происходило и как реагировали люди?",
        hint: "Наблюдаемые факты отдельно от догадок.",
        rows: 5
      },
      {
        key: "result",
        label: "Чем закончилась ситуация?",
        rows: 4
      },
      {
        key: "learning",
        label: "Что нового узнал мозг?",
        rows: 4
      },
      {
        key: "nextAttempt",
        label: "Что повторю или изменю в следующий раз?",
        rows: 4
      },
      {
        key: "notes",
        label: "Что ещё важно сохранить из этого опыта?",
        hint: "Инсайт, вопрос к психологу или деталь, которую не хочется потерять.",
        rows: 4
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

const TRIGGER_COLUMNS = [
  {
    key: "situation",
    label: "Ситуация / триггер",
    placeholder: "Что вызывает чувство или задевает убеждение?"
  },
  {
    key: "difficulty",
    label: "Сложность для психики",
    placeholder: "0-100",
    kind: "percent"
  },
  {
    key: "avoidanceActions",
    label: "Охранительно-избегающие действия",
    placeholder: "Как успокаиваюсь, спасаюсь или избегаю?"
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
let actionRows = [];
let triggerRows = [];
let activeView = "entry";
let toastTimer = 0;
let listRenderTimer = 0;
let printCleanupTimer = 0;
let titleBeforePrint = "";

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  load();
  if (entries.length === 0 && activeView === "entry") {
    createEntry("diary", { silent: true });
  }
  render();
  bindEvents();
});

function bindElements() {
  elements.entryList = document.getElementById("entryList");
  elements.searchInput = document.getElementById("searchInput");
  elements.titleInput = document.getElementById("titleInput");
  elements.registryTitle = document.getElementById("registryTitle");
  elements.entryTypeLabel = document.getElementById("entryTypeLabel");
  elements.entryDateLabel = document.getElementById("entryDateLabel");
  elements.entryDateInput = document.getElementById("entryDateInput");
  elements.tagsInput = document.getElementById("tagsInput");
  elements.entryMetaRow = document.getElementById("entryMetaRow");
  elements.formRoot = document.getElementById("formRoot");
  elements.editorPanel = document.getElementById("editorPanel");
  elements.emptyState = document.getElementById("emptyState");
  elements.toast = document.getElementById("toast");
  elements.printRoot = document.getElementById("printRoot");
  elements.importFileInput = document.getElementById("importFileInput");
  elements.deleteDialog = document.getElementById("deleteDialog");
  elements.deleteDialogRecord = document.getElementById("deleteDialogRecord");
}

function bindEvents() {
  document.getElementById("newDiaryButton").addEventListener("click", () => createEntry("diary"));
  document.getElementById("newDiagnosticButton").addEventListener("click", () => createEntry("diagnostic"));
  document.getElementById("newScenarioButton").addEventListener("click", () => createEntry("scenario"));
  document.getElementById("actionsPageButton").addEventListener("click", () => openRegistry("actions"));
  document.getElementById("triggersPageButton").addEventListener("click", () => openRegistry("triggers"));
  document.getElementById("emptyNewDiaryButton").addEventListener("click", () => createEntry("diary"));
  document.getElementById("emptyNewDiagnosticButton").addEventListener("click", () => createEntry("diagnostic"));
  document.getElementById("emptyNewScenarioButton").addEventListener("click", () => createEntry("scenario"));
  document.getElementById("emptyActionsPageButton").addEventListener("click", () => openRegistry("actions"));
  document.getElementById("emptyTriggersPageButton").addEventListener("click", () => openRegistry("triggers"));
  document.getElementById("duplicateButton").addEventListener("click", duplicateActive);
  document.getElementById("deleteButton").addEventListener("click", deleteActive);
  document.getElementById("copyButton").addEventListener("click", copyActive);
  document.getElementById("downloadMarkdownButton").addEventListener("click", downloadActiveMarkdown);
  document.getElementById("printButton").addEventListener("click", printActive);
  document.getElementById("storagePrintButton").addEventListener("click", printActive);
  document.getElementById("backupButton").addEventListener("click", downloadBackup);
  document.getElementById("importButton").addEventListener("click", () => elements.importFileInput.click());
  elements.importFileInput.addEventListener("change", importBackup);
  elements.deleteDialog.addEventListener("close", handleDeleteDialogClose);
  elements.deleteDialog.addEventListener("click", (event) => {
    if (event.target === elements.deleteDialog) elements.deleteDialog.close("cancel");
  });

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
  const storedActiveId = localStorage.getItem(ACTIVE_KEY) || "";
  const migration = migrateLegacyReports(entries.map(normalizeEntry), storedActiveId);
  const normalizedEntries = migration.entries;
  const legacyActionEntries = normalizedEntries.filter((entry) => entry.type === "actions");
  const legacyActionRows = legacyActionEntries.flatMap((entry) => entry.fields.actionRows || []);
  actionRows = mergeRegistryRows(
    readStoredRows(ACTIONS_STORAGE_KEY),
    legacyActionRows,
    ACTION_COLUMNS
  );
  triggerRows = normalizeRegistryRows(readStoredRows(TRIGGERS_STORAGE_KEY), TRIGGER_COLUMNS);
  entries = normalizedEntries
    .filter((entry) => entry.type !== "actions")
    .filter(shouldPersistEntry);
  const storedView = localStorage.getItem(VIEW_STORAGE_KEY);
  activeId = migration.activeId;
  activeView = storedView && REGISTRY_META[storedView]
    ? storedView
    : (legacyActionEntries.some((entry) => entry.id === activeId) ? "actions" : "entry");
  if (!entries.some((entry) => entry.id === activeId)) {
    activeId = entries[0]?.id || "";
  }
  if (legacyActionEntries.length || migration.changed) save();
}

function save() {
  const persistedEntries = getPersistedEntries();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedEntries));
  localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(getPersistedRegistryRows(actionRows)));
  localStorage.setItem(TRIGGERS_STORAGE_KEY, JSON.stringify(getPersistedRegistryRows(triggerRows)));
  localStorage.setItem(VIEW_STORAGE_KEY, activeView);
  if (persistedEntries.some((entry) => entry.id === activeId)) {
    localStorage.setItem(ACTIVE_KEY, activeId);
  } else {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

function createEntry(type, options = {}) {
  if (!TYPE_META[type] || type === "actions" || type === "report") return;
  discardEmptyEntries();
  discardEmptyRegistryRows();
  activeView = "entry";
  const now = new Date();
  const entry = {
    id: createId(),
    type,
    title: options.title || TYPE_META[type].defaultTitle,
    date: options.date || toDateInputValue(now),
    tags: options.tags || "",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    fields: {
      ...createDefaultEntryFields(type),
      ...(options.fields || {})
    },
    rationalization: {},
    rationalizationEnabled: false,
    report: type === "scenario" ? createDefaultReport() : {},
    reportEnabled: false,
    notes: ""
  };
  entries.unshift(entry);
  activeId = entry.id;
  save();
  render();
  if (!options.silent) {
    showToast(options.message || "Запись создана");
  }
}

function createDefaultEntryFields(type) {
  if (type === "scenario") return { steps: [""], noDoActions: [""] };
  return {};
}

function createDefaultReport(values = {}) {
  const report = values && typeof values === "object" ? { ...values } : {};
  delete report.linkedScenarioId;
  if (!Array.isArray(report.actualEvents)) report.actualEvents = [""];
  return report;
}

function openRegistry(view) {
  if (!REGISTRY_META[view]) return;
  discardEmptyEntries();
  discardEmptyRegistryRows();
  activeView = view;
  save();
  render();
}

function createEmptyActionRow() {
  return createEmptyRegistryRow(ACTION_COLUMNS);
}

function createEmptyRegistryRow(columns) {
  return columns.reduce((row, column) => {
    row[column.key] = "";
    return row;
  }, {});
}

function readStoredRows(key) {
  try {
    const rows = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function normalizeRegistryRows(rows, columns) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => columns.reduce((normalized, column) => {
    normalized[column.key] = row?.[column.key] ?? "";
    return normalized;
  }, {})).filter(hasPrintableValue);
}

function mergeRegistryRows(storedRows, importedRows, columns) {
  const seen = new Set();
  return normalizeRegistryRows([...storedRows, ...importedRows], columns).filter((row) => {
    const fingerprint = JSON.stringify(row);
    if (seen.has(fingerprint)) return false;
    seen.add(fingerprint);
    return true;
  });
}

function normalizeEntry(entry) {
  const normalized = {
    ...entry,
    fields: entry?.fields && typeof entry.fields === "object" ? entry.fields : {},
    rationalization: entry?.rationalization && typeof entry.rationalization === "object" ? entry.rationalization : {},
    notes: entry?.notes || ""
  };
  if (normalized.type === "scenario") {
    if (!Array.isArray(normalized.fields.steps)) normalized.fields.steps = [""];
    if (!Array.isArray(normalized.fields.noDoActions)) normalized.fields.noDoActions = [""];
    normalized.report = createDefaultReport(normalized.report);
    normalized.reportEnabled = Boolean(normalized.reportEnabled || hasMeaningfulValue(normalized.report));
    return normalized;
  }
  if (normalized.type === "report") {
    if (!Array.isArray(normalized.fields.actualEvents)) normalized.fields.actualEvents = [""];
    return normalized;
  }
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

function migrateLegacyReports(sourceEntries, storedActiveId = "") {
  const reports = sourceEntries.filter((entry) => entry.type === "report");
  if (!reports.length) {
    return { entries: sourceEntries, activeId: storedActiveId, changed: false };
  }

  const migrated = sourceEntries.filter((entry) => entry.type !== "report");
  const scenarios = new Map(migrated.filter((entry) => entry.type === "scenario").map((entry) => [entry.id, entry]));
  const occupiedScenarios = new Set(
    migrated
      .filter((entry) => entry.type === "scenario" && (entry.reportEnabled || hasMeaningfulValue(entry.report)))
      .map((entry) => entry.id)
  );
  let nextActiveId = storedActiveId;

  reports.forEach((legacyReport) => {
    const linkedScenario = scenarios.get(legacyReport.fields.linkedScenarioId);
    const report = createDefaultReport({
      ...legacyReport.fields,
      reportDate: legacyReport.fields.reportDate || legacyReport.date || "",
      notes: legacyReport.notes || legacyReport.fields.notes || ""
    });

    if (linkedScenario && !occupiedScenarios.has(linkedScenario.id)) {
      linkedScenario.report = report;
      linkedScenario.reportEnabled = true;
      linkedScenario.updatedAt = [linkedScenario.updatedAt, legacyReport.updatedAt].filter(Boolean).sort().at(-1) || new Date().toISOString();
      occupiedScenarios.add(linkedScenario.id);
      if (nextActiveId === legacyReport.id) nextActiveId = linkedScenario.id;
      return;
    }

    const subject = String(legacyReport.title || "").replace(/^Отч[её]т:\s*/i, "").trim();
    const scenario = normalizeEntry({
      ...legacyReport,
      id: legacyReport.id || createId(),
      type: "scenario",
      title: subject ? `Сценарий: ${subject}` : "Сценарий с отчётом",
      fields: { steps: [""], noDoActions: [""] },
      report,
      reportEnabled: true,
      notes: "",
      rationalization: {},
      rationalizationEnabled: false
    });
    migrated.push(scenario);
    scenarios.set(scenario.id, scenario);
  });

  return { entries: migrated, activeId: nextActiveId, changed: true };
}

function duplicateActive() {
  if (activeView !== "entry") return;
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
  if (activeView !== "entry") return;
  const entry = getActiveEntry();
  if (!entry) return;
  elements.deleteDialogRecord.textContent = entry.title || TYPE_META[entry.type].defaultTitle;
  elements.deleteDialog.dataset.entryId = entry.id;
  elements.deleteDialog.returnValue = "";
  elements.deleteDialog.showModal();
}

function handleDeleteDialogClose() {
  const entryId = elements.deleteDialog.dataset.entryId || "";
  delete elements.deleteDialog.dataset.entryId;
  if (elements.deleteDialog.returnValue !== "confirm" || !entryId) return;
  if (!entries.some((entry) => entry.id === entryId)) return;
  entries = entries.filter((entry) => entry.id !== entryId);
  activeId = entries[0]?.id || "";
  save();
  render();
  showToast("Запись удалена");
}

function render() {
  renderNavigation();
  renderList();
  renderEditor();
}

function renderNavigation() {
  ["actions", "triggers"].forEach((view) => {
    const button = document.getElementById(`${view}PageButton`);
    const isActive = activeView === view;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
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
  const activeClass = activeView === "entry" && entry.id === activeId ? " active" : "";
  return `
    <button class="entry-card${activeClass}" type="button" data-entry-id="${escapeAttr(entry.id)}">
      <span class="entry-title">${escapeHTML(title)}</span>
      <span class="entry-meta">${escapeHTML(meta)}</span>
    </button>
  `;
}

function renderEditor() {
  const entry = getActiveEntry();
  const isRegistry = Boolean(REGISTRY_META[activeView]);
  const hasContent = isRegistry || Boolean(entry);
  elements.editorPanel.classList.toggle("hidden", !hasContent);
  elements.emptyState.classList.toggle("hidden", hasContent);
  document.querySelector(".topbar").classList.toggle("hidden", !hasContent);

  if (isRegistry) {
    const meta = REGISTRY_META[activeView];
    elements.entryTypeLabel.textContent = "Постоянный список";
    elements.titleInput.classList.add("hidden");
    elements.registryTitle.classList.remove("hidden");
    elements.registryTitle.textContent = meta.title;
    elements.entryMetaRow.classList.add("hidden");
    document.getElementById("duplicateButton").classList.add("hidden");
    document.getElementById("deleteButton").classList.add("hidden");
    elements.formRoot.innerHTML = activeView === "actions"
      ? renderActionsRegistry()
      : renderTriggersRegistry();
    return;
  }

  if (!entry) return;

  elements.entryTypeLabel.textContent = TYPE_META[entry.type].label;
  elements.titleInput.classList.remove("hidden");
  elements.registryTitle.classList.add("hidden");
  elements.entryMetaRow.classList.remove("hidden");
  document.getElementById("duplicateButton").classList.remove("hidden");
  document.getElementById("deleteButton").classList.remove("hidden");
  elements.titleInput.value = entry.title || TYPE_META[entry.type].defaultTitle;
  elements.entryDateLabel.textContent = getEntryDateLabel(entry.type);
  elements.entryDateInput.value = entry.date || "";
  elements.tagsInput.value = entry.tags || "";
  const renderers = {
    diary: renderDiary,
    diagnostic: renderDiagnostic,
    scenario: renderScenario
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

function renderScenario(entry) {
  return `
    <div class="protocol-intro scenario-intro">
      <div>
        <p class="protocol-kicker">До экспозиции</p>
        <h2>Маршрут без импровизации</h2>
        <p>Опиши наблюдаемые действия заранее: где начинаешь, что говоришь, чего не делаешь и сколько остаёшься в ситуации.</p>
      </div>
    </div>
    <div class="scenario-builder">
      ${SCENARIO_SECTIONS.map((section) => renderProtocolSection(section, entry, "scenario")).join("")}
    </div>
    ${renderScenarioReportBranch(entry)}
    ${renderNotes(entry)}
  `;
}

function renderScenarioReportBranch(entry) {
  const gate = `
    <section class="scenario-report-gate">
      <div>
        <p class="protocol-kicker">После выполнения</p>
        <h2>Отчёт по сценарию</h2>
        <p>Раскрой отчёт, когда сценарий выполнен, и зафиксируй факты по свежей памяти.</p>
      </div>
      <label class="switch-row report-switch">
        <input type="checkbox" data-path="reportEnabled" ${entry.reportEnabled ? "checked" : ""}>
        <span>Сценарий выполнен — заполнить отчёт</span>
      </label>
    </section>
  `;

  if (!entry.reportEnabled) return gate;

  return gate + `
    <div class="embedded-report">
      <div class="protocol-intro report-intro">
        <div>
          <p class="protocol-kicker">После экспозиции</p>
          <h2>Факты вместо общей оценки</h2>
          <p>Восстанови ход событий по эпизодам: действие, чувство, телесная реакция, реальные последствия и следующий шаг.</p>
        </div>
      </div>
      <div class="report-builder">
        ${REPORT_SECTIONS.map((section) => renderProtocolSection(section, entry, "report", "report")).join("")}
      </div>
    </div>
  `;
}

function renderProtocolSection(section, entry, variant, rootPath = "fields") {
  const values = rootPath === "report" ? entry.report : entry.fields;
  const fields = section.fields.map((field) => renderProtocolField(field, entry, variant, values, rootPath)).join("");
  const sectionClass = variant === "scenario"
    ? `protocol-section scenario-phase tone-${section.tone || "coral"}`
    : "protocol-section report-phase";
  return `
    <section class="${sectionClass}" data-protocol-step="${escapeAttr(section.index)}">
      <div class="protocol-section-header">
        <span class="protocol-step">${escapeHTML(section.index)}</span>
        <h2>${escapeHTML(section.title)}</h2>
      </div>
      <div class="protocol-fields ${variant === "report" && section.index === "02" ? "feeling-curve-fields" : ""}">
        ${fields}
      </div>
    </section>
  `;
}

function renderProtocolField(field, entry, variant, values, rootPath) {
  if (field.kind === "ordered-list" || field.kind === "checklist") {
    return renderEntryListField(entry, field, values, rootPath);
  }
  const className = variant === "report" && field.kind === "range" ? " protocol-rating" : "";
  return `<div class="protocol-field${className}" data-field-key="${escapeAttr(field.key)}">${renderField(field, values[field.key], `${rootPath}.${field.key}`)}</div>`;
}

function renderEntryListField(entry, field, values, rootPath) {
  const storedItems = Array.isArray(values[field.key]) ? values[field.key] : [];
  const items = storedItems.length ? storedItems : [""];
  const isChecklist = field.kind === "checklist";
  return `
    <div class="protocol-field entry-list-field ${isChecklist ? "no-do-list" : "route-list"}" data-field-key="${escapeAttr(field.key)}">
      <div class="entry-list-heading">
        <div>
          <p class="field-label">${escapeHTML(field.label)}</p>
          ${field.hint ? `<p class="hint">${escapeHTML(field.hint)}</p>` : ""}
        </div>
        <span>${items.filter(hasPrintableValue).length}</span>
      </div>
      <div class="entry-list-items">
        ${items.map((item, index) => `
          <div class="entry-list-item">
            <span class="entry-list-index">${isChecklist ? "не" : index + 1}</span>
            <textarea rows="${isChecklist ? 2 : 3}" data-path="${escapeAttr(rootPath)}.${escapeAttr(field.key)}.${index}" placeholder="${isChecklist ? "Какое действие исключаю?" : (field.key === "actualEvents" ? "Что произошло в этом эпизоде?" : "Что конкретно делаю на этом шаге?")}">${escapeHTML(item || "")}</textarea>
            <div class="entry-list-controls" aria-label="Управление строкой ${index + 1}">
              <button class="list-icon-button" type="button" data-move-entry-list="-1" data-list-root="${escapeAttr(rootPath)}" data-list-key="${escapeAttr(field.key)}" data-list-index="${index}" title="Переместить выше" aria-label="Переместить строку ${index + 1} выше" ${index === 0 ? "disabled" : ""}>↑</button>
              <button class="list-icon-button" type="button" data-move-entry-list="1" data-list-root="${escapeAttr(rootPath)}" data-list-key="${escapeAttr(field.key)}" data-list-index="${index}" title="Переместить ниже" aria-label="Переместить строку ${index + 1} ниже" ${index === items.length - 1 ? "disabled" : ""}>↓</button>
              <button class="list-icon-button danger" type="button" data-remove-entry-list data-list-root="${escapeAttr(rootPath)}" data-list-key="${escapeAttr(field.key)}" data-list-index="${index}" title="Удалить строку" aria-label="Удалить строку ${index + 1}">×</button>
            </div>
          </div>
        `).join("")}
      </div>
      <button class="button add-entry-list-item" type="button" data-add-entry-list="${escapeAttr(field.key)}" data-list-root="${escapeAttr(rootPath)}">${isChecklist ? "Добавить запрет" : (field.key === "actualEvents" ? "Добавить эпизод" : "Добавить шаг")}</button>
    </div>
  `;
}

function renderActionsRegistry() {
  return renderRegistryTable({
    view: "actions",
    heading: "Быстрый разбор действий",
    hint: "Одна ситуация - одна строка. Список дополняется, а не создаётся заново.",
    columns: ACTION_COLUMNS,
    rows: actionRows
  });
}

function renderTriggersRegistry() {
  return renderRegistryTable({
    view: "triggers",
    heading: "Иерархия триггеров",
    hint: "Добавляй даже небольшие триггеры и оценивай силу реакции от 0 до 100%.",
    columns: TRIGGER_COLUMNS,
    rows: triggerRows
  });
}

function renderRegistryTable({ view, heading, hint, columns, rows }) {
  const visibleRows = rows.length ? rows : [createEmptyRegistryRow(columns)];
  return `
    <section class="actions-sheet">
      <div class="actions-sheet-heading">
        <div>
          <h2>${escapeHTML(heading)}</h2>
          <p class="hint">${escapeHTML(hint)}</p>
        </div>
        <span class="action-row-count">Строк: ${rows.length}</span>
      </div>
      <div class="actions-table registry-table registry-table-${escapeAttr(view)}" role="table" aria-label="${escapeAttr(REGISTRY_META[view].title)}">
        <div class="actions-table-head" role="row">
          ${columns.map((column) => `<div role="columnheader">${escapeHTML(column.label)}</div>`).join("")}
          <span aria-hidden="true"></span>
        </div>
        <div class="actions-table-body">
          ${visibleRows.map((row, index) => renderRegistryRow(view, columns, row, index)).join("")}
        </div>
      </div>
      <button class="button add-action-row" type="button" data-add-registry-row="${escapeAttr(view)}">Добавить строку</button>
    </section>
  `;
}

function renderRegistryRow(view, columns, row, index) {
  return `
    <div class="action-table-row" role="row">
      ${columns.map((column) => `
        <label class="action-table-cell" role="cell">
          <span class="action-cell-label">${escapeHTML(column.label)}</span>
          ${column.kind === "percent" ? `
            <span class="percent-input">
              <input type="number" min="0" max="100" inputmode="numeric" data-registry="${escapeAttr(view)}" data-row-index="${index}" data-key="${escapeAttr(column.key)}" value="${escapeAttr(row?.[column.key] ?? "")}" placeholder="${escapeAttr(column.placeholder)}" aria-label="${escapeAttr(column.label)}">
              <span aria-hidden="true">%</span>
            </span>
          ` : `
            <textarea rows="2" data-registry="${escapeAttr(view)}" data-row-index="${index}" data-key="${escapeAttr(column.key)}" placeholder="${escapeAttr(column.placeholder)}">${escapeHTML(row?.[column.key] || "")}</textarea>
          `}
        </label>
      `).join("")}
      <button class="icon-button remove-action-row" type="button" data-remove-registry-row="${index}" data-registry="${escapeAttr(view)}" title="Удалить строку" aria-label="Удалить строку ${index + 1}">&times;</button>
    </div>
  `;
}

function getActionRows(entry) {
  const rows = entry?.fields?.actionRows;
  return Array.isArray(rows) && rows.length ? rows : [createEmptyActionRow()];
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

  if (field.kind === "time" || field.kind === "number" || field.kind === "date") {
    const input = `<input type="${field.kind}" value="${escapeAttr(value ?? "")}" data-path="${escapeAttr(path)}" ${field.min !== undefined ? `min="${escapeAttr(field.min)}"` : ""}>`;
    return `
      <label class="field">
        <span>${escapeHTML(field.label)}</span>
        ${field.hint ? `<p class="hint">${escapeHTML(field.hint)}</p>` : ""}
        ${field.suffix ? `<span class="suffixed-input">${input}<span>${escapeHTML(field.suffix)}</span></span>` : input}
      </label>
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
  discardEmptyRegistryRows();
  activeView = "entry";
  activeId = card.dataset.entryId;
  save();
  render();
}

function handleFormInput(event) {
  const registryControl = event.target.closest("[data-registry][data-row-index][data-key]");
  if (registryControl) {
    updateRegistryControl(registryControl, false);
    return;
  }
  const control = event.target.closest("[data-path]");
  if (!control) return;
  const entry = getActiveEntry();
  if (!entry) return;

  ensureEntryListForPath(entry, control.dataset.path);
  ensureActionRows(entry, control.dataset.path);
  setPath(entry, control.dataset.path, getControlValue(control));
  if (control.type === "range") {
    const output = control.parentElement.querySelector("output");
    if (output) output.textContent = `${control.value}%`;
  }
  touchAndSave(entry);
}

function handleFormChange(event) {
  const registryControl = event.target.closest("[data-registry][data-row-index][data-key]");
  if (registryControl) {
    updateRegistryControl(registryControl, true);
    return;
  }
  const control = event.target.closest("[data-path]");
  if (!control) return;
  const entry = getActiveEntry();
  if (!entry) return;

  ensureEntryListForPath(entry, control.dataset.path);
  ensureActionRows(entry, control.dataset.path);
  setPath(entry, control.dataset.path, getControlValue(control));
  touchAndSave(entry);

  if (control.type === "radio" || control.type === "checkbox") {
    renderEditorPreservingViewport();
  }
}

function handleFormClick(event) {
  const addRegistryRow = event.target.closest("[data-add-registry-row]");
  const removeRegistryRow = event.target.closest("[data-remove-registry-row]");
  if (addRegistryRow || removeRegistryRow) {
    const view = addRegistryRow?.dataset.addRegistryRow || removeRegistryRow?.dataset.registry;
    const rows = getRegistryRows(view);
    const columns = getRegistryColumns(view);
    if (!rows || !columns) return;
    if (addRegistryRow) {
      rows.push(createEmptyRegistryRow(columns));
    } else {
      const index = Number(removeRegistryRow.dataset.removeRegistryRow);
      if (Number.isInteger(index) && index >= 0 && index < rows.length) {
        rows.splice(index, 1);
      }
    }
    save();
    renderEditorPreservingViewport();
    return;
  }

  const addEntryList = event.target.closest("[data-add-entry-list]");
  const removeEntryList = event.target.closest("[data-remove-entry-list]");
  const moveEntryList = event.target.closest("[data-move-entry-list]");
  if (addEntryList || removeEntryList || moveEntryList) {
    const entry = getActiveEntry();
    if (!entry) return;
    const control = addEntryList || removeEntryList || moveEntryList;
    const key = addEntryList?.dataset.addEntryList || control.dataset.listKey;
    const root = control.dataset.listRoot || "fields";
    if (!isEntryListKey(entry.type, root, key)) return;
    const values = root === "report" ? entry.report : entry.fields;
    if (!Array.isArray(values[key])) values[key] = [];
    const items = values[key];
    if (addEntryList) {
      items.push("");
    } else {
      const index = Number(control.dataset.listIndex);
      if (!Number.isInteger(index) || index < 0 || index >= items.length) return;
      if (removeEntryList) {
        items.splice(index, 1);
      } else {
        const targetIndex = index + Number(moveEntryList.dataset.moveEntryList);
        if (targetIndex < 0 || targetIndex >= items.length) return;
        [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
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

function ensureEntryListForPath(entry, path) {
  const match = String(path || "").match(/^(fields|report)\.(steps|noDoActions|actualEvents)\.(\d+)$/);
  if (!match || !isEntryListKey(entry.type, match[1], match[2])) return;
  const root = match[1];
  const key = match[2];
  const index = Number(match[3]);
  const values = root === "report" ? entry.report : entry.fields;
  if (!Array.isArray(values[key])) values[key] = [];
  while (values[key].length <= index) values[key].push("");
}

function isEntryListKey(type, root, key) {
  if (type !== "scenario") return false;
  if (root === "fields") return key === "steps" || key === "noDoActions";
  return root === "report" && key === "actualEvents";
}

function updateRegistryControl(control, clampPercent) {
  const view = control.dataset.registry;
  const rows = getRegistryRows(view);
  const columns = getRegistryColumns(view);
  const index = Number(control.dataset.rowIndex);
  const key = control.dataset.key;
  if (!rows || !columns || !Number.isInteger(index) || !columns.some((column) => column.key === key)) return;
  while (rows.length <= index) rows.push(createEmptyRegistryRow(columns));
  let value = control.value;
  if (clampPercent && columns.find((column) => column.key === key)?.kind === "percent" && value !== "") {
    value = Math.max(0, Math.min(100, Number(value) || 0));
    control.value = String(value);
  }
  rows[index][key] = value;
  save();
  const count = elements.formRoot.querySelector(".action-row-count");
  if (count) count.textContent = `Строк: ${rows.length}`;
}

function getRegistryRows(view) {
  if (view === "actions") return actionRows;
  if (view === "triggers") return triggerRows;
  return null;
}

function getRegistryColumns(view) {
  if (view === "actions") return ACTION_COLUMNS;
  if (view === "triggers") return TRIGGER_COLUMNS;
  return null;
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
  if (REGISTRY_META[activeView]) {
    if (!getPersistedRegistryRows(getRegistryRows(activeView)).length) {
      showToast("Список пока пуст");
      return;
    }
    copyText(formatRegistryMarkdown(activeView))
      .then(() => showToast("Список скопирован"))
      .catch(() => showToast("Не удалось скопировать"));
    return;
  }
  const entry = getActiveEntry();
  if (!entry) return;
  const text = formatEntryMarkdown(entry);
  copyText(text)
    .then(() => showToast("Запись скопирована"))
    .catch(() => showToast("Не удалось скопировать"));
}

function downloadActiveMarkdown() {
  if (REGISTRY_META[activeView]) {
    if (!getPersistedRegistryRows(getRegistryRows(activeView)).length) {
      showToast("Список пока пуст");
      return;
    }
    downloadBlob(
      formatRegistryMarkdown(activeView),
      `${formatRegistryExportBaseName(activeView)}.md`,
      "text/markdown;charset=utf-8"
    );
    return;
  }
  const entry = getActiveEntry();
  if (!entry) return;
  const fileName = `${formatExportBaseName(entry)}.md`;
  downloadBlob(formatEntryMarkdown(entry), fileName, "text/markdown;charset=utf-8");
}

function printActive() {
  if (REGISTRY_META[activeView]) {
    if (!getPersistedRegistryRows(getRegistryRows(activeView)).length) {
      showToast("Сначала добавь хотя бы одну строку");
      return;
    }
    elements.printRoot.innerHTML = renderPrintRegistry(activeView);
    startPrint(formatRegistryExportBaseName(activeView));
    return;
  }
  const entry = getActiveEntry();
  if (!entry) return;
  if (!shouldPersistEntry(entry)) {
    showToast("Сначала заполни хотя бы одно поле");
    return;
  }
  elements.printRoot.innerHTML = renderPrintEntry(entry);
  startPrint(formatExportBaseName(entry));
}

function startPrint(title) {
  document.body.classList.add("printing");
  titleBeforePrint = document.title;
  document.title = title;
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
    version: 2,
    exportedAt: new Date().toISOString(),
    entries: getPersistedEntries(),
    actionRows: getPersistedRegistryRows(actionRows),
    triggerRows: getPersistedRegistryRows(triggerRows)
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
      const importedEntries = Array.isArray(parsed) ? parsed : (parsed.entries || []);
      const importedActionRows = Array.isArray(parsed?.actionRows) ? parsed.actionRows : [];
      const importedTriggerRows = Array.isArray(parsed?.triggerRows) ? parsed.triggerRows : [];
      if (!Array.isArray(importedEntries)) throw new Error("Invalid entries");
      if (!importedEntries.length && !importedActionRows.length && !importedTriggerRows.length) {
        throw new Error("No data");
      }
      const usedIds = new Set(entries.map((entry) => entry.id));
      const importedIdMap = new Map();
      const normalized = importedEntries.map((entry) => {
        const originalId = entry.id || "";
        let nextId = originalId || createId();
        if (usedIds.has(nextId)) nextId = createId();
        usedIds.add(nextId);
        if (originalId) importedIdMap.set(originalId, nextId);
        return normalizeEntry({
          ...entry,
          id: nextId,
          fields: entry.fields || {},
          rationalization: entry.rationalization || {},
          notes: entry.notes || ""
        });
      });
      normalized.forEach((entry) => {
        if (entry.type !== "report") return;
        const linkedId = entry.fields.linkedScenarioId;
        if (importedIdMap.has(linkedId)) entry.fields.linkedScenarioId = importedIdMap.get(linkedId);
      });
      const migratedImport = migrateLegacyReports(normalized, normalized[0]?.id || "");
      const migratedEntries = migratedImport.entries;
      const legacyActionRows = migratedEntries
        .filter((entry) => entry.type === "actions")
        .flatMap((entry) => entry.fields.actionRows || []);
      const persistedImported = migratedEntries
        .filter((entry) => entry.type !== "actions")
        .filter(shouldPersistEntry);
      entries = [...persistedImported, ...entries].filter(shouldPersistEntry);
      actionRows = mergeRegistryRows(actionRows, [...importedActionRows, ...legacyActionRows], ACTION_COLUMNS);
      triggerRows = mergeRegistryRows(triggerRows, importedTriggerRows, TRIGGER_COLUMNS);
      activeId = migratedImport.activeId || persistedImported[0]?.id || entries[0]?.id || "";
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
  if (entry.date) lines.push(`${getEntryDateLabel(entry.type)}: ${formatDate(entry.date)}`);
  if (entry.tags) lines.push(`Теги: ${entry.tags}`);
  lines.push("");

  if (entry.type === "actions") {
    appendActionRowsMarkdown(lines, getActionRows(entry));
  } else {
    appendSectionsMarkdown(lines, getSectionsForEntry(entry), entry.fields, entry);
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
      appendSectionsMarkdown(lines, RATIONALIZATION_SECTIONS, entry.rationalization, entry);
    }
  }
  if (entry.type === "scenario" && shouldIncludeScenarioReport(entry)) {
    lines.push("# Отчёт по сценарию");
    lines.push("");
    appendSectionsMarkdown(lines, REPORT_SECTIONS, entry.report, entry);
  }
  appendNotesMarkdown(lines, entry);

  return lines.join("\n").trim() + "\n";
}

function formatRegistryMarkdown(view) {
  const meta = REGISTRY_META[view];
  const columns = getRegistryColumns(view);
  const rows = getPersistedRegistryRows(getRegistryRows(view));
  const lines = [
    `# ${meta.title}`,
    "",
    `Дата экспорта: ${formatDate(toDateInputValue(new Date()))}`,
    "",
    `| № | ${columns.map((column) => formatMarkdownTableCell(column.label)).join(" | ")} |`,
    `| --- | ${columns.map(() => "---").join(" | ")} |`
  ];
  rows.forEach((row, index) => {
    const cells = columns.map((column) => formatMarkdownTableCell(formatRegistryValue(column, row[column.key])));
    lines.push(`| ${index + 1} | ${cells.join(" | ")} |`);
  });
  return lines.join("\n").trim() + "\n";
}

function formatMarkdownTableCell(value) {
  return String(value ?? "-")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>");
}

function formatRegistryValue(column, value) {
  if (!hasPrintableValue(value)) return "-";
  if (column.kind === "percent") return `${value}%`;
  return String(value);
}

function appendSectionsMarkdown(lines, sections, values, entry) {
  sections.forEach((section) => {
    lines.push(`## ${section.index}. ${section.title}`);
    lines.push("");
    section.fields.forEach((field) => {
      const value = values[field.key];
      lines.push(`**${field.label}**`);
      lines.push("");
      lines.push(formatEntryFieldValue(entry, field, value));
      lines.push("");
    });
  });
}

function formatEntryFieldValue(entry, field, value) {
  if (!hasPrintableValue(value)) return "-";
  if (field.kind === "date") return formatDate(value);
  if (field.kind === "scenario-select") {
    const scenario = entries.find((item) => item.id === value && item.type === "scenario");
    return scenario?.title || "Связанный сценарий не найден";
  }
  if (field.kind === "ordered-list") {
    return value.filter(hasPrintableValue).map((item, index) => `${index + 1}. ${item}`).join("\n");
  }
  if (field.kind === "checklist") {
    return value.filter(hasPrintableValue).map((item) => `- ${item}`).join("\n");
  }
  if (field.suffix) return `${value} ${field.suffix}`;
  return printValue(value);
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
  if (entry.type === "scenario") return SCENARIO_SECTIONS;
  if (entry.type === "report") return REPORT_SECTIONS;
  return DIARY_SECTIONS;
}

function renderPrintRegistry(view) {
  const meta = REGISTRY_META[view];
  const rows = getPersistedRegistryRows(getRegistryRows(view));
  const columns = getRegistryColumns(view);
  return `
    <article class="print-entry print-registry print-registry-${escapeAttr(view)}">
      <header class="print-cover">
        <div class="print-cover-top">
          <span class="print-kicker">Психологические практики</span>
          <span class="print-type">${escapeHTML(meta.label)}</span>
        </div>
        <h1>${escapeHTML(meta.title)}</h1>
        <div class="print-meta">
          <div class="print-meta-item">
            <span>Тип</span>
            <strong>Постоянный список</strong>
          </div>
          <div class="print-meta-item">
            <span>Строк</span>
            <strong>${rows.length}</strong>
          </div>
          <div class="print-meta-item">
            <span>Экспорт</span>
            <strong>${escapeHTML(formatDate(toDateInputValue(new Date())))}</strong>
          </div>
        </div>
      </header>
      <p class="print-note">Пустые строки не включены. Порядок строк сохранён.</p>
      ${renderPrintRegistryTable(rows, columns, view)}
    </article>
  `;
}

function renderPrintEntry(entry) {
  const body = entry.type === "actions"
    ? renderPrintActionRows(getActionRows(entry))
    : renderPrintSections(getSectionsForEntry(entry), entry.fields, entry);
  const rationalization = entry.type === "diary" && (entry.rationalizationEnabled || entry.fields.realProblemSolved === "no")
    ? renderPrintSections(RATIONALIZATION_SECTIONS, entry.rationalization, entry)
    : "";
  const report = entry.type === "scenario" && shouldIncludeScenarioReport(entry)
    ? `
      <section class="print-report-divider">
        <span>После выполнения</span>
        <h2>Отчёт по сценарию</h2>
      </section>
      ${renderPrintSections(REPORT_SECTIONS, entry.report, entry)}
    `
    : "";
  const notes = renderPrintNotes(entry);
  const decision = entry.type === "diary" && entry.fields.realProblemSolved
    ? `
      <section class="print-section print-decision">
        <div class="print-section-header">
          <h2>Переход к рационализации</h2>
          <span class="print-step">после пункта 6</span>
        </div>
        <div class="print-field">
          <div class="print-field-label">Действие решало реальную проблему?</div>
          <div class="print-field-value">${escapeHTML(decisionLabel(entry.fields.realProblemSolved))}</div>
        </div>
      </section>
    `
    : "";
  const tags = String(entry.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
  return `
    <article class="print-entry">
      <header class="print-cover">
        <div class="print-cover-top">
          <span class="print-kicker">Психологические практики</span>
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
              <span>${escapeHTML(getEntryDateLabel(entry.type))}</span>
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
      ${body}
      ${decision}
      ${rationalization}
      ${report}
      ${notes}
    </article>
  `;
}

function renderPrintNotes(entry) {
  if (!hasPrintableValue(entry.notes)) return "";
  return `
    <section class="print-section">
      <div class="print-section-header">
        <h2>Заметки</h2>
        <span class="print-step">после</span>
      </div>
      <div class="print-field">
        <div class="print-field-label">Впечатления и инсайты после заполнения</div>
        <div class="print-field-value">${escapeHTML(printValue(entry.notes))}</div>
      </div>
    </section>
  `;
}

function renderPrintSections(sections, values, entry) {
  return sections.map((section) => {
    const fields = section.fields
      .map((field) => ({ field, value: values[field.key] }))
      .filter(({ value }) => hasPrintableValue(value));

    if (fields.length === 0) return "";

    return `
      <section class="print-section">
        <div class="print-section-header">
          <h2>${escapeHTML(section.title)}</h2>
          <span class="print-step">${escapeHTML(section.index)}</span>
        </div>
        <div class="print-fields">
          ${fields.map(({ field, value }) => `
            <div class="print-field">
              <div class="print-field-label">${escapeHTML(field.label)}</div>
              <div class="print-field-value">${escapeHTML(formatEntryFieldValue(entry, field, value))}</div>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function renderPrintActionRows(rows) {
  return renderPrintRegistryTable(rows, ACTION_COLUMNS, "actions");
}

function renderPrintRegistryTable(rows, columns, view) {
  const printableRows = rows.filter(hasPrintableValue);
  return `
    <table class="print-registry-table print-registry-table-${escapeAttr(view)}">
      <thead>
        <tr>
          <th scope="col" class="print-table-number">№</th>
          ${columns.map((column) => `<th scope="col">${escapeHTML(column.label)}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${printableRows.map((row, index) => `
          <tr>
            <th scope="row" class="print-table-number">${index + 1}</th>
            ${columns.map((column) => `<td>${escapeHTML(formatRegistryValue(column, row[column.key]))}</td>`).join("")}
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
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
    ...Object.values(entry.rationalization || {}),
    ...Object.values(entry.report || {})
  ].map(searchValue).join(" ").toLowerCase();
}

function searchValue(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(searchValue).join(" ");
  if (typeof value === "object") return Object.values(value).map(searchValue).join(" ");
  return String(value);
}

function getPersistedEntries() {
  return entries
    .filter((entry) => ["diary", "diagnostic", "scenario"].includes(entry.type))
    .filter(shouldPersistEntry);
}

function getPersistedRegistryRows(rows) {
  return Array.isArray(rows) ? rows.filter(hasMeaningfulValue) : [];
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
    entry.rationalizationEnabled ||
    hasMeaningfulValue(entry.report)
  );
}

function shouldIncludeScenarioReport(entry) {
  return Boolean(entry?.reportEnabled || hasMeaningfulValue(entry?.report));
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

function discardEmptyRegistryRows() {
  actionRows = getPersistedRegistryRows(actionRows);
  triggerRows = getPersistedRegistryRows(triggerRows);
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

function getEntryDateLabel(type) {
  if (type === "scenario") return "Дата выполнения";
  if (type === "report") return "Дата отчёта";
  return "Дата ситуации";
}

function formatExportBaseName(entry) {
  const type = TYPE_META[entry.type]?.label || "Запись";
  const date = formatFileDate(entry.date);
  const name = sanitizeFilePart(entry.tags || entry.title || TYPE_META[entry.type]?.defaultTitle || "");
  return [type, date, name].filter(Boolean).join("_");
}

function formatRegistryExportBaseName(view) {
  const meta = REGISTRY_META[view];
  return `${meta.fileName}_${formatFileDate(toDateInputValue(new Date()))}`;
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
