const MESSAGES = {
  en: {
    "nav.projects": "projects",
    "nav.team": "team",
    "nav.support": "support",
    "hero.command": "whoami",
    "hero.lead": "Open-source libraries and tools for Roblox developers.",
    "hero.docs": "Bloom documentation →",
    "hero.github": "GitHub organization ↗",
    "projects.title": "Projects",
    "bloom.text": "Low-level graphics library for Roblox: draws pixels, lines, shapes, textures, text and CPU shaders on EditableImage through a fast buffer.",
    "bloom.docs": "Documentation",
    "bloom.start": "Quick start",
    "soon.badge": "soon",
    "soon.text": "The next project is in the works. Follow the organization on GitHub to see it first.",
    "soon.follow": "Follow on GitHub ↗",
    "team.title": "Team",
    "team.owner": "Studio owner",
    "team.creator": "Creator of Bloom",
    "support.title": "Support",
    "support.text": "Our libraries are free and open source. If they help you, you can support the studio.",
    "support.donate": "♥ Donate via DonateX ↗",
  },
  ru: {
    "nav.projects": "проекты",
    "nav.team": "команда",
    "nav.support": "поддержать",
    "hero.command": "whoami",
    "hero.lead": "Открытые библиотеки и инструменты для разработчиков Roblox.",
    "hero.docs": "Документация Bloom →",
    "hero.github": "Организация на GitHub ↗",
    "projects.title": "Проекты",
    "bloom.text": "Низкоуровневая графическая библиотека для Roblox: рисует пиксели, линии, фигуры, текстуры, текст и CPU-шейдеры на EditableImage через быстрый buffer.",
    "bloom.docs": "Документация",
    "bloom.start": "Быстрый старт",
    "soon.badge": "скоро",
    "soon.text": "Следующий проект уже в работе. Подпишись на организацию на GitHub, чтобы увидеть его первым.",
    "soon.follow": "Подписаться на GitHub ↗",
    "team.title": "Команда",
    "team.owner": "Владелец студии",
    "team.creator": "Автор Bloom",
    "support.title": "Поддержать",
    "support.text": "Наши библиотеки бесплатные и с открытым кодом. Если они тебе помогают, можно поддержать студию.",
    "support.donate": "♥ Поддержать через DonateX ↗",
  },
};

const LANGUAGES = Object.keys(MESSAGES);
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

const VERTEX_SOURCE = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SOURCE = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

float ribbon(vec2 p, float time, float seed) {
  float y = sin(p.x * 1.6 + time * 0.35 + seed) * 0.16
          + sin(p.x * 3.1 - time * 0.22 + seed * 1.7) * 0.06
          + sin(p.x * 0.7 + time * 0.12 + seed * 0.5) * 0.10;
  float distance = abs(p.y - y);
  return smoothstep(0.0035, 0.0, distance) * 0.55 + smoothstep(0.09, 0.0, distance) * 0.12;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = vec2((uv.x - 0.5) * u_resolution.x / u_resolution.y, uv.y - 0.42);
  vec3 color = mix(vec3(0.0, 0.12, 0.34), vec3(0.01, 0.03, 0.1), smoothstep(0.0, 1.0, uv.y));
  float light = 0.0;
  for (int index = 0; index < 14; index++) {
    float layer = float(index);
    light += ribbon(p + vec2(0.0, (layer - 7.0) * 0.012), u_time * (1.0 + layer * 0.015), layer * 0.21) * (0.35 + 0.65 * fract(layer * 0.618));
  }
  for (int index = 0; index < 6; index++) {
    float layer = float(index);
    light += ribbon((p + vec2(0.0, 0.18 + layer * 0.02)) * vec2(0.8, 1.0), u_time * 0.8, 3.0 + layer * 0.35) * 0.35;
  }
  color += vec3(0.55, 0.8, 1.0) * light;
  color *= 1.0 - 0.35 * pow(length(uv - 0.5) * 1.3, 2.0);
  gl_FragColor = vec4(color, 1.0);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

function setupBackdrop() {
  const canvas = document.getElementById("backdrop");
  const gl = canvas?.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
  if (!canvas || !gl) {
    canvas?.remove();
    return;
  }

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) {
    canvas.remove();
    return;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    canvas.remove();
    return;
  }

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, "u_resolution");
  const time = gl.getUniformLocation(program, "u_time");

  const resize = () => {
    const scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
    canvas.width = Math.max(1, Math.floor(window.innerWidth * scale));
    canvas.height = Math.max(1, Math.floor(window.innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolution, canvas.width, canvas.height);
  };

  const started = performance.now();
  let last = 0;
  const step = (now) => {
    window.requestAnimationFrame(step);
    if (now - last < 1000 / 30) {
      return;
    }
    last = now;
    gl.uniform1f(time, (now - started) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  resize();
  window.addEventListener("resize", resize);
  window.requestAnimationFrame(step);
}

setupLanguage();
setupBackdrop();
