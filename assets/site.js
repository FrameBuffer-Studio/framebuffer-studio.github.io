const MESSAGES = {
  en: {
    "tab.home": "home",
    "tab.products": "products",
    "tab.team": "team",
    "tab.support": "support",
    "home.eyebrow": "open-source studio for roblox",
    "home.lead": "We build low-level libraries and tools that make Roblox do things it was never meant to do.",
    "home.products": "See products →",
    "principle.low.title": "Low-level",
    "principle.low.text": "We work directly with pixels and buffers. No hidden magic, full control.",
    "principle.fast.title": "Fast",
    "principle.fast.text": "Native Luau, strict types and careful memory use in every line.",
    "principle.open.title": "Open",
    "principle.open.text": "Free, open source and documented so simply that anyone can start.",
    "products.eyebrow": "everything we ship",
    "products.title": "Products",
    "status.live": "released",
    "status.soon": "in development",
    "spec.language": "language",
    "spec.target": "target",
    "spec.features": "features",
    "spec.license": "license",
    "bloom.text": "Low-level graphics library for Roblox: draws pixels, lines, shapes, textures, text and CPU shaders on EditableImage through a fast buffer.",
    "bloom.features": "tiles, shapes, textures, TTF fonts, CPU shaders, scheduler",
    "bloom.docs": "Documentation →",
    "bloom.start": "Quick start",
    "soon.text": "The next product is in the works. Follow the organization on GitHub to see it first.",
    "soon.follow": "Follow on GitHub ↗",
    "team.eyebrow": "people behind the studio",
    "team.title": "Team",
    "team.owner": "Studio owner",
    "team.creator": "Creator of Bloom",
    "support.eyebrow": "keep it free",
    "support.title": "Support",
    "support.text": "Our libraries are free and open source. If they help you, you can support the studio.",
    "support.donate": "♥ Donate via DonateX ↗",
  },
  ru: {
    "tab.home": "главная",
    "tab.products": "продукты",
    "tab.team": "команда",
    "tab.support": "поддержать",
    "home.eyebrow": "open-source студия для roblox",
    "home.lead": "Делаем низкоуровневые библиотеки и инструменты, которые заставляют Roblox делать то, для чего он не был создан.",
    "home.products": "Смотреть продукты →",
    "principle.low.title": "Низкоуровнево",
    "principle.low.text": "Работаем напрямую с пикселями и буферами. Никакой скрытой магии, полный контроль.",
    "principle.fast.title": "Быстро",
    "principle.fast.text": "Нативный Luau, строгие типы и бережная работа с памятью в каждой строчке.",
    "principle.open.title": "Открыто",
    "principle.open.text": "Бесплатно, с открытым кодом и с документацией, понятной любому.",
    "products.eyebrow": "всё, что мы выпускаем",
    "products.title": "Продукты",
    "status.live": "выпущен",
    "status.soon": "в разработке",
    "spec.language": "язык",
    "spec.target": "основа",
    "spec.features": "умеет",
    "spec.license": "лицензия",
    "bloom.text": "Низкоуровневая графическая библиотека для Roblox: рисует пиксели, линии, фигуры, текстуры, текст и CPU-шейдеры на EditableImage через быстрый buffer.",
    "bloom.features": "тайлы, фигуры, текстуры, TTF-шрифты, CPU-шейдеры, планировщик",
    "bloom.docs": "Документация →",
    "bloom.start": "Быстрый старт",
    "soon.text": "Следующий продукт уже в работе. Подпишись на организацию на GitHub, чтобы увидеть его первым.",
    "soon.follow": "Подписаться на GitHub ↗",
    "team.eyebrow": "люди за студией",
    "team.title": "Команда",
    "team.owner": "Владелец студии",
    "team.creator": "Автор Bloom",
    "support.eyebrow": "чтобы всё оставалось бесплатным",
    "support.title": "Поддержать",
    "support.text": "Наши библиотеки бесплатные и с открытым кодом. Если они тебе помогают, можно поддержать студию.",
    "support.donate": "♥ Поддержать через DonateX ↗",
  },
};

const LANGUAGES = Object.keys(MESSAGES);
const VIEWS = ["home", "products", "team", "support"];
const STORAGE_KEY = "framebuffer:language";

function readLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.includes(saved)) {
      return saved;
    }
  } catch {
    return "en";
  }
  const preferred = navigator.languages.map((tag) => tag.slice(0, 2).toLowerCase()).find((tag) => LANGUAGES.includes(tag));
  return preferred ?? "en";
}

function applyLanguage(language) {
  const messages = MESSAGES[language];
  document.documentElement.lang = language;
  for (const element of document.querySelectorAll("[data-i18n]")) {
    const text = messages[element.dataset.i18n];
    if (text !== undefined) {
      element.textContent = text;
    }
  }
  for (const marker of document.querySelectorAll("[data-lang]")) {
    marker.setAttribute("aria-current", String(marker.dataset.lang === language));
  }
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    return;
  }
}

function setupLanguage() {
  let language = readLanguage();
  applyLanguage(language);
  document.getElementById("lang")?.addEventListener("click", () => {
    language = LANGUAGES[(LANGUAGES.indexOf(language) + 1) % LANGUAGES.length];
    applyLanguage(language);
  });
}

function currentView() {
  const name = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  return VIEWS.includes(name) ? name : "home";
}

let pending = [];

function revealVisible() {
  const limit = window.innerHeight * 0.92;
  let batch = 0;
  pending = pending.filter((item) => {
    if (item.getBoundingClientRect().top >= limit) {
      return true;
    }
    item.style.setProperty("--order", String(Math.min(batch, 6)));
    item.classList.add("in");
    batch += 1;
    return false;
  });
}

function revealView(panel) {
  pending = [...panel.querySelectorAll("[data-reveal]")];
  for (const item of pending) {
    item.classList.remove("in");
  }
  window.setTimeout(revealVisible, 60);
}

function showView() {
  const active = currentView();
  for (const panel of document.querySelectorAll("section.view")) {
    panel.hidden = panel.dataset.view !== active;
    if (!panel.hidden) {
      revealView(panel);
    }
  }
  for (const tab of document.querySelectorAll(".tab")) {
    tab.setAttribute("aria-selected", String(tab.dataset.view === active));
  }
  window.scrollTo({ top: 0 });
}

setupLanguage();
showView();
window.addEventListener("hashchange", showView);
window.addEventListener("scroll", revealVisible, { passive: true });
window.addEventListener("resize", revealVisible);
