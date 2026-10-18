const VIEWS = ["home", "products", "team", "support"];
const STORAGE_KEY = "framebuffer:language";
const SAFE_URL = /^(https:\/\/|\.\/|#\/)/;

const state = {
  config: null,
  language: "en",
  pending: [],
};

function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(props)) {
    if (name === "className") {
      element.className = value;
    } else if (value !== undefined && value !== null && value !== false) {
      element.setAttribute(name, value === true ? "" : String(value));
    }
  }
  for (const child of children.flat()) {
    if (child !== null && child !== undefined && child !== false) {
      element.append(child instanceof Node ? child : String(child));
    }
  }
  return element;
}

function text(value) {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object") {
    return value[state.language] ?? value[state.config.defaultLanguage] ?? Object.values(value)[0] ?? "";
  }
  return "";
}

function ui(key, params = {}) {
  return text(state.config.ui[key]).replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match);
}

function link(url, className, ...children) {
  if (typeof url !== "string" || !SAFE_URL.test(url)) {
    return h("span", { className }, ...children);
  }
  const external = url.startsWith("https://");
  return h(
    "a",
    { className, href: url, target: external ? "_blank" : undefined, rel: external ? "noopener noreferrer" : undefined },
    ...children,
  );
}

function setLink(element, url) {
  if (typeof url === "string" && SAFE_URL.test(url)) {
    element.href = url;
    element.hidden = false;
  } else {
    element.hidden = true;
  }
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function splitBrand(name) {
  const match = /^([A-Z]?[a-z0-9]+)([A-Z].*)$/.exec(name);
  return match ? [match[1], match[2]] : [name, ""];
}

function renderPrinciples() {
  const root = document.getElementById("principles");
  root.replaceChildren(
    ...state.config.principles.map((principle, index) =>
      h(
        "div",
        { className: "principle", "data-reveal": true },
        h("span", { className: "principle-index" }, String(index + 1).padStart(2, "0")),
        h("h3", { className: "principle-title" }, text(principle.title)),
        h("p", { className: "principle-text" }, text(principle.text)),
      ),
    ),
  );
}

function renderMarquee() {
  const words = state.config.marquee;
  const items = words.flatMap((word) => [h("span", {}, word), h("span", { className: "marquee-star", "aria-hidden": "true" }, "✦")]);
  const copy = items.map((item) => item.cloneNode(true));
  document.getElementById("marquee").replaceChildren(...items, ...copy);
  document.querySelector(".marquee").hidden = words.length === 0;
}

function renderProducts() {
  document.getElementById("products").replaceChildren(
    ...state.config.products.map((product, index) =>
      h(
        "article",
        { className: product.status === "released" ? "product" : "product upcoming", "data-reveal": true, id: `product-${product.id}` },
        h(
          "div",
          { className: "product-top" },
          h("span", { className: "product-number" }, `P-${String(index + 1).padStart(3, "0")}`),
          h("span", { className: product.status === "released" ? "status live" : "status" }, ui(`status.${product.status}`)),
        ),
        h("h3", { className: "product-name" }, product.name),
        product.tagline ? h("p", { className: "product-tagline" }, text(product.tagline)) : null,
        h("p", { className: "product-text" }, text(product.description)),
        product.specs?.length
          ? h(
              "dl",
              { className: "specs" },
              ...product.specs.map((spec) => h("div", {}, h("dt", {}, text(spec.label)), h("dd", {}, text(spec.value)))),
            )
          : null,
        product.links?.length
          ? h(
              "div",
              { className: "product-links" },
              ...product.links.map((entry) => link(entry.url, entry.primary ? "button solid" : "button", text(entry.label))),
            )
          : null,
      ),
    ),
  );
}

function renderTeam() {
  document.getElementById("team").replaceChildren(
    ...state.config.team.map((person) =>
      link(
        person.url,
        "person",
        h("span", { className: "person-initial", "aria-hidden": "true" }, person.name.slice(0, 1).toUpperCase()),
        h("span", { className: "person-name" }, person.name),
        h("span", { className: "person-role" }, text(person.role)),
        person.url ? h("span", { className: "person-link" }, `${person.url.replace(/^https:\/\//, "")} ↗`) : null,
      ),
    ),
  );
  for (const person of document.querySelectorAll("#team .person")) {
    person.setAttribute("data-reveal", "");
  }
}

function renderChrome() {
  const { brand, links } = state.config;
  const [first, second] = splitBrand(brand.name);
  document.getElementById("brand-name").textContent = brand.name;
  document.getElementById("brand-suffix").textContent = brand.suffix ?? "";
  document.getElementById("display-first").textContent = first;
  document.getElementById("display-second").textContent = second;
  const fullName = `${brand.name} ${capitalize(brand.suffix ?? "")}`.trim();
  document.getElementById("copyright").textContent = `© ${brand.year ?? new Date().getFullYear()} ${fullName}`;
  document.title = fullName;
  setLink(document.getElementById("github-link"), links.github);

  const donate = document.getElementById("donate-button");
  setLink(donate, links.donate?.url);
  donate.textContent = links.donate ? ui("support.donate", { label: links.donate.label }) : "";
  document.querySelector('.tab[data-view="support"]').hidden = !links.donate;

  const footer = [
    links.github ? link(links.github, "", "GitHub") : null,
    links.donate ? link(links.donate.url, "", links.donate.label) : null,
  ].filter(Boolean);
  document.getElementById("footer-links").replaceChildren(...footer);

  for (const element of document.querySelectorAll("[data-ui]")) {
    element.textContent = ui(element.dataset.ui);
  }

  const toggle = document.getElementById("lang");
  toggle.replaceChildren(
    ...state.config.languages.flatMap((code, index) => [
      ...(index > 0 ? [h("span", { className: "lang-sep" }, "/")] : []),
      h("span", { "data-lang": code, "aria-current": String(code === state.language) }, code.toUpperCase()),
    ]),
  );
  toggle.hidden = state.config.languages.length < 2;
  document.documentElement.lang = state.language;
}

function render() {
  renderChrome();
  renderMarquee();
  renderPrinciples();
  renderProducts();
  renderTeam();
  showView();
}

function revealVisible() {
  const limit = window.innerHeight * 0.92;
  let batch = 0;
  state.pending = state.pending.filter((item) => {
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
  state.pending = [...panel.querySelectorAll("[data-reveal]")];
  for (const item of state.pending) {
    item.classList.remove("in");
  }
  window.setTimeout(revealVisible, 60);
}

function currentView() {
  const name = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  const visible = VIEWS.filter((view) => !document.querySelector(`.tab[data-view="${view}"]`)?.hidden);
  return visible.includes(name) ? name : "home";
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

function chooseLanguage(config) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && config.languages.includes(saved)) {
      return saved;
    }
  } catch {
    return config.defaultLanguage;
  }
  const preferred = navigator.languages.map((tag) => tag.slice(0, 2).toLowerCase()).find((tag) => config.languages.includes(tag));
  return preferred ?? config.defaultLanguage;
}

function rememberLanguage(language) {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    return;
  }
}

function isConfig(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.brand?.name === "string" &&
    Array.isArray(value.languages) &&
    value.languages.length > 0 &&
    typeof value.defaultLanguage === "string" &&
    typeof value.ui === "object" &&
    Array.isArray(value.products) &&
    Array.isArray(value.team) &&
    typeof value.links === "object"
  );
}

async function start() {
  const response = await fetch("./studio.json", { credentials: "same-origin", cache: "no-cache" });
  const config = await response.json();
  if (!response.ok || !isConfig(config)) {
    throw new Error("studio.json is missing or invalid");
  }
  state.config = { marquee: [], principles: [], ...config };
  state.language = chooseLanguage(state.config);

  render();
  window.addEventListener("hashchange", showView);
  window.addEventListener("scroll", revealVisible, { passive: true });
  window.addEventListener("resize", revealVisible);
  document.getElementById("lang").addEventListener("click", () => {
    const languages = state.config.languages;
    state.language = languages[(languages.indexOf(state.language) + 1) % languages.length];
    rememberLanguage(state.language);
    render();
  });
}

start().catch((error) => {
  document.querySelector(".page").replaceChildren(h("p", { className: "lead fatal" }, String(error.message ?? error)));
});
