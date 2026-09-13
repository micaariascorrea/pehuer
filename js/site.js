import { apply, setLang, t, locale } from "./i18n.js";

const CINE_MOD = "./network-cine.js?v=cine33";
const MOON_MOD = "./moon-globe.js";

import(MOON_MOD);

apply();
document.querySelectorAll("[data-set-lang]").forEach((btn) => {
  btn.addEventListener("click", () => {
    setLang(btn.getAttribute("data-set-lang"));
    renderList();
    if (heroRef) setHeroCard(heroRef);
    if (loaderText && loader && !loader.classList.contains("is-hide") && !moonReady) {
      loaderText.textContent = t("moon.loading");
    }
  });
});

const TABS = ["home", "servicios", "moon", "unite"];
const TAB_ALIAS = { sistema: "servicios", system: "servicios", contacto: "unite", contact: "unite" };
const HERO_TOUR = [
  { i: 30, img: "assets/tour/apollo11.jpg" },
  { i: 80, img: "assets/tour/carroll.jpg" },
  { i: 35, img: "assets/tour/apollo17.jpg" },
  { i: 4, img: "assets/tour/shackleton.jpg" },
  { i: 18, img: "assets/tour/tycho.jpg" },
];

const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll("[data-panel]")];
const search = document.getElementById("ref-search");
const listEl = document.getElementById("ref-list");
const countEl = document.getElementById("ref-count");
const canvas = document.getElementById("moon-canvas");
const loader = document.getElementById("moon-loader");
const loaderText = document.getElementById("moon-loader-text");
const status = document.getElementById("moon-status");
const heroCanvas = document.getElementById("hero-canvas");
const cineCanvas = document.getElementById("sys-cine");
const heroCard = document.getElementById("hero-card");
const heroCardImg = document.getElementById("hero-card-img");
const heroCardName = document.getElementById("hero-card-name");
const heroCardDesc = document.getElementById("hero-card-desc");

let refs = [];
let filtered = [];
let highlight = 0;
let activeI = null;
let moon = null;
let moonReady = false;
let moonStarting = false;
let pendingFly = null;
let statusTimer = 0;
let hero = null;
let heroStarting = false;
let cine = null;
let cineStarting = false;
let heroTimer = 0;
let heroStep = 0;
let heroRef = null;

function fold(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function resolveTab(id) {
  if (TAB_ALIAS[id]) return TAB_ALIAS[id];
  return TABS.includes(id) ? id : "home";
}

function afterPaint(fn) {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}

let tabGen = 0;

function openTab(id) {
  const raw = id;
  id = resolveTab(id);
  const gen = ++tabGen;
  tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.tab === id));
  panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === id));
  if (location.hash.slice(1) !== id) {
    history.replaceState(null, "", "#" + id);
  }
  if (hero) hero.setPaused(id !== "home");
  if (cine) cine.setPaused(id !== "servicios");
  if (moon) moon.setPaused(id !== "moon");
  if (id !== "home") clearTimeout(heroTimer);
  if (id === "home") {
    startHero();
    setHeroActive(true);
  } else if (id === "servicios") {
    startCine();
    if (cine) cine.resize();
  } else if (id === "moon") {
    if (search) search.focus({ preventScroll: true });
    startMoon();
    if (moon) moon.resize();
  } else if (id === "unite" && (raw === "contacto" || raw === "contact")) {
    afterPaint(() => document.getElementById("unite-contact")?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    }));
  }
  afterPaint(() => {
    if (gen !== tabGen) return;
    if (id === "home" && hero) hero.resize();
    else if (id === "servicios" && cine) cine.resize();
    else if (id === "moon" && moon) moon.resize();
  });
}

function warmTab(id) {
  if (id === "servicios") import(CINE_MOD);
  else if (id === "moon" || id === "home") import(MOON_MOD);
}

tabs.forEach((btn) => {
  btn.addEventListener("click", () => openTab(btn.dataset.tab));
  btn.addEventListener("pointerenter", () => warmTab(btn.dataset.tab), { once: true });
});

window.addEventListener("hashchange", () => {
  openTab(location.hash.slice(1));
});

document.querySelectorAll("[data-go]").forEach((btn) => {
  btn.addEventListener("click", () => openTab(btn.getAttribute("data-go")));
});

document.querySelectorAll("[data-scroll]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(btn.getAttribute("data-scroll"))?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  });
});

function matches(r, q) {
  const blob = [r.name, r.tipo, r.agencia, r.origen, r.detalle, r.kind, r.misiones, r.anio, r.fuente]
    .filter((v) => v != null && v !== "")
    .join(" ");
  return fold(blob).includes(q);
}

function kindLabel(r) {
  if (r.kind === "mision") return r.tripulada ? t("moon.kind.crew") : t("moon.kind.uncrewed");
  if (r.kind === "orbita") return t("moon.kind.orbita");
  if (r.kind === "dato") return t("moon.kind.dato");
  return t("moon.kind.lugar");
}

function renderList() {
  const q = fold(search.value.trim());
  filtered = q ? refs.filter((r) => matches(r, q)) : refs.slice();

  countEl.textContent = q
    ? t(filtered.length === 1 ? "moon.count.one" : "moon.count.many", { n: filtered.length })
    : t("moon.count.all", { n: refs.length });

  if (highlight >= filtered.length) highlight = 0;

  listEl.replaceChildren(
    ...filtered.map((r, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ref-btn";
      if (r.kind === "mision") b.classList.add("is-mision");
      if (r.kind === "mision" && r.tripulada) b.classList.add("is-tripulada");
      if (r.kind === "orbita") b.classList.add("is-orbita");
      if (r.kind === "dato") b.classList.add("is-dato");
      if (r.kind === "lugar") b.classList.add("is-lugar");
      if (r.i === activeI) b.classList.add("is-active");
      if (idx === highlight) b.classList.add("is-hl");
      const kicker = kindLabel(r);
      const title =
        (r.kind === "mision" || r.kind === "dato") && r.anio
          ? `${r.name} · ${r.anio}`
          : r.name;
      b.innerHTML =
        (kicker ? `<span class="ref-kicker">${escapeHtml(kicker)}</span>` : "") +
        `<span class="ref-name">${escapeHtml(title)}</span>` +
        `<span class="ref-tipo">${escapeHtml(listMeta(r))}</span>`;
      b.addEventListener("click", () => {
        highlight = idx;
        fly(r);
        renderList();
      });
      return b;
    })
  );
}

function listMeta(r) {
  if (r.kind === "orbita") {
    const loc = locale();
    const inc = r.inclinacion != null ? "i = " + Number(r.inclinacion).toLocaleString(loc) + "°" : r.tipo;
    const alt =
      r.perilune_km != null && r.apolune_km != null
        ? r.perilune_km.toLocaleString(loc) + " × " + r.apolune_km.toLocaleString(loc) + " km"
        : r.altitud_km != null
          ? "h ≈ " + r.altitud_km + " km"
          : "";
    const used = r.misiones
      ? t("moon.meta.missions", { v: r.misiones })
      : t("moon.meta.orbitClass");
    const src = r.fuente ? t("moon.meta.source", { v: r.fuente }) : "";
    return [r.tipo, inc, alt, used, src].filter(Boolean).join(" · ");
  }
  if (r.kind === "mision") {
    const crew = r.tripulada ? t("moon.meta.crew") : t("moon.meta.uncrewed");
    const src = r.fuente ? t("moon.meta.source", { v: r.fuente }) : "";
    return [r.agencia || r.tipo, crew, fmtCoord(r), src].filter(Boolean).join(" · ");
  }
  if (r.kind === "dato") {
    const src = r.fuente ? t("moon.meta.source", { v: r.fuente }) : "";
    return [r.tipo, r.agencia, r.origen, src].filter(Boolean).join(" · ");
  }
  const src = r.fuente ? t("moon.meta.source", { v: r.fuente }) : "";
  return [r.tipo, fmtCoord(r), src].filter(Boolean).join(" · ");
}

function fmtCoord(r) {
  const ns = r.lat < 0 ? "S" : "N";
  const ew = r.lon < 0 ? "W" : "E";
  return `${Math.abs(r.lat).toFixed(2)}°${ns} ${Math.abs(r.lon).toFixed(2)}°${ew}`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function showStatus(text) {
  status.textContent = text;
  status.classList.add("is-on");
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => status.classList.remove("is-on"), 1400);
}

function statusLabel(r) {
  if (r.kind === "mision") {
    const base = t(r.tripulada ? "moon.status.crew" : "moon.status.uncrewed", { name: r.name });
    return r.anio ? `${base} · ${r.anio}` : base;
  }
  if (r.kind === "orbita") return t("moon.status.orbit", { name: r.name });
  if (r.kind === "dato") {
    const base = t("moon.status.data", { name: r.name });
    return r.anio ? `${base} · ${r.anio}` : base;
  }
  return r.name;
}

async function startMoon() {
  if (moon || moonStarting) return;
  moonStarting = true;
  try {
    const { createMoonGlobe } = await import(MOON_MOD);
    moon = createMoonGlobe(canvas, { pinScale: 0.12, autoStart: false });
    moon.setRefs(refs);
    moon.resize();
    try {
      await moon.ready;
    } catch (_) {}
    moonReady = true;
    loader.classList.add("is-hide");
    moon.resize();
    const onMoon = document.querySelector('[data-panel="moon"]').classList.contains("is-active");
    moon.setPaused(!onMoon);
    if (pendingFly && onMoon) {
      const r = pendingFly;
      pendingFly = null;
      fly(r);
    }
  } catch (err) {
    if (loaderText) {
      loaderText.textContent = t("moon.fail");
    }
    console.error(err);
  }
}

function fly(r) {
  activeI = r.i;
  if (!moonReady) {
    pendingFly = r;
    startMoon();
    showStatus(t("moon.preparing"));
    return;
  }
  moon.flyTo(r);
  showStatus(statusLabel(r));
}

canvas.addEventListener("pehuer-pick", (e) => {
  const r = e.detail;
  activeI = r.i;
  const idx = filtered.findIndex((x) => x.i === r.i);
  if (idx >= 0) highlight = idx;
  renderList();
  showStatus(statusLabel(r));
});

search.addEventListener("input", () => {
  highlight = 0;
  renderList();
});

search.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    highlight = Math.min(highlight + 1, Math.max(filtered.length - 1, 0));
    renderList();
    const el = listEl.children[highlight];
    if (el) el.scrollIntoView({ block: "nearest" });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    highlight = Math.max(highlight - 1, 0);
    renderList();
    const el = listEl.children[highlight];
    if (el) el.scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter" && filtered[highlight]) {
    e.preventDefault();
    fly(filtered[highlight]);
    renderList();
  }
});

const initial = location.hash.slice(1);
openTab(resolveTab(initial));

fetch("data/refs.json")
  .then((r) => r.json())
  .then((data) => {
    refs = data;
    renderList();
    if (moon) moon.setRefs(refs);
    if (hero) hero.setRefs(tourRefs(true));
  })
  .catch(() => {
    countEl.textContent = t("moon.refsFail");
  });

function tourRefs(wide) {
  const ids = new Set(HERO_TOUR.map((s) => s.i));
  return refs.filter((r) => ids.has(r.i) && (!wide || Math.abs(r.lat) < 70));
}

function setHeroCard(r) {
  if (!heroCard) return;
  heroRef = r || null;
  if (!r) {
    heroCard.hidden = true;
    return;
  }
  const stop = HERO_TOUR.find((s) => s.i === r.i);
  heroCard.hidden = false;
  if (heroCardName) heroCardName.textContent = r.name;
  if (heroCardDesc) heroCardDesc.textContent = t(`tour.${r.i}.desc`);
  if (heroCardImg && stop) {
    heroCardImg.src = stop.img;
    heroCardImg.alt = r.name;
  }
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function nextHeroStop() {
  if (!hero) return;
  const wide = heroStep % 2 === 1;
  if (wide) {
    if (refs.length) hero.setRefs(tourRefs(true));
    hero.wideShot();
    setHeroCard(null);
  } else {
    const stop = HERO_TOUR[Math.floor(heroStep / 2) % HERO_TOUR.length];
    const r = refs.find((x) => x.i === stop.i);
    if (r) {
      hero.setRefs([r]);
      hero.flyTo(r);
      setHeroCard(r);
    }
  }
  heroStep += 1;
  heroTimer = setTimeout(nextHeroStop, wide ? 3800 : 5600);
}

function setHeroActive(on) {
  if (hero) {
    hero.setPaused(!on);
    if (on) hero.resize();
  }
  clearTimeout(heroTimer);
  if (on && hero && !prefersReducedMotion() && refs.length) {
    nextHeroStop();
  }
}

async function startCine() {
  if (!cineCanvas || cine || cineStarting) return;
  cineStarting = true;
  try {
    const { createNetworkCine } = await import(CINE_MOD);
    cine = createNetworkCine(cineCanvas);
    cine.resize();
    const onSys = document.querySelector('[data-panel="servicios"]').classList.contains("is-active");
    cine.setPaused(!onSys);
    cine.ready.then(() => cine.resize()).catch(() => {});
  } catch (err) {
    console.error(err);
  }
}

async function startHero() {
  if (!heroCanvas || hero || heroStarting) return;
  heroStarting = true;
  try {
    const { createMoonGlobe } = await import(MOON_MOD);
    hero = createMoonGlobe(heroCanvas, {
      interactive: false,
      dem: false,
      autoStart: false,
      flyStep: 0.016,
      zoomIn: 0.9,
      pinScale: 0.14,
    });
    if (refs.length) hero.setRefs(tourRefs(true));
    hero.resize();
    const onHome = document.querySelector('[data-panel="home"]').classList.contains("is-active");
    setHeroActive(onHome);
    import(CINE_MOD);
    hero.ready.then(() => {
      hero.resize();
      if (!navigator.connection?.saveData) new Image().src = "assets/earth.jpg";
    }).catch(() => {});
  } catch (err) {
    console.error(err);
  }
}
