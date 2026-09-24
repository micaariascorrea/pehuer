import { apply, setLang, t, locale, ROOT, maybeDetectLang } from "./i18n.js";
import { refText } from "./ref-text.js";

const MOON_MOD = "./moon-globe.js";
const DEMO_MOD = "./sys-demo.js?v=demo14";

maybeDetectLang();
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

const TABS = ["home", "servicios", "moon", "sumate"];
const TAB_ALIAS = {
  sistema: "servicios",
  system: "servicios",
  unite: "sumate",
  join: "sumate",
  contacto: "sumate",
  contact: "sumate",
};
const HERO_TOUR = [
  { i: 30, img: `${ROOT}/assets/tour/apollo11.jpg` },
  { i: 80, img: `${ROOT}/assets/tour/carroll.jpg` },
  { i: 35, img: `${ROOT}/assets/tour/apollo17.jpg` },
  { i: 4, img: `${ROOT}/assets/tour/shackleton.jpg` },
  { i: 18, img: `${ROOT}/assets/tour/tycho.jpg` },
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
let demo = null;
let demoStarting = false;
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
  tabs.forEach((tab) => {
    const on = tab.dataset.tab === id;
    tab.classList.toggle("is-active", on);
    tab.setAttribute("aria-selected", on ? "true" : "false");
    tab.tabIndex = on ? 0 : -1;
  });
  panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === id));
  if (location.hash.slice(1) !== id) {
    history.replaceState(null, "", "#" + id);
  }
  if (hero) hero.setPaused(id !== "home");
  if (demo) demo.setPaused(id !== "servicios");
  if (moon) moon.setPaused(id !== "moon");
  if (id !== "home") clearTimeout(heroTimer);
  if (id === "home") {
    scheduleHero();
    setHeroActive(true);
  } else if (id === "servicios") {
    startDemo();
  } else if (id === "moon") {
    if (search) search.focus({ preventScroll: true });
    startMoon();
    if (moon) moon.resize();
  } else if (id === "sumate" && (raw === "contacto" || raw === "contact")) {
    afterPaint(() => document.getElementById("unite-contact")?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    }));
  }
  afterPaint(() => {
    if (gen !== tabGen) return;
    if (id === "home" && hero) hero.resize();
    else if (id === "moon" && moon) moon.resize();
  });
}

function warmTab(id) {
  if (id === "servicios") import(DEMO_MOD);
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

const joinOverlay = document.getElementById("join-overlay");
const joinForm = document.getElementById("join-form");
const joinSubject = document.getElementById("join-subject");
const joinEmail = document.getElementById("join-email");
const joinMessage = document.getElementById("join-message");
const joinStatus = document.getElementById("join-status");
const joinSubmit = joinForm?.querySelector(".form-submit");
let joinKey = "";

function setJoinStatus(kind, text) {
  if (!joinStatus) return;
  joinStatus.hidden = !text;
  joinStatus.textContent = text || "";
  joinStatus.classList.toggle("is-ok", kind === "ok");
  joinStatus.classList.toggle("is-err", kind === "err");
}

function joinFocusables() {
  if (!joinOverlay) return [];
  return [...joinOverlay.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")].filter(
    (el) => !el.hidden && !el.classList.contains("form-honey") && el.tabIndex !== -1
  );
}

function closeJoin() {
  if (!joinOverlay) return;
  joinOverlay.hidden = true;
  document.body.classList.remove("form-open");
  document.querySelector(".app")?.removeAttribute("inert");
  joinOpener?.focus();
}

let joinOpener = null;

function openJoin(key, opener) {
  joinKey = key;
  joinOpener = opener || document.activeElement;
  if (!joinOverlay || !joinForm) return;
  joinForm.reset();
  joinSubject.value = t(key);
  setJoinStatus("", "");
  if (joinSubmit) joinSubmit.disabled = false;
  joinOverlay.hidden = false;
  document.body.classList.add("form-open");
  document.querySelector(".app")?.setAttribute("inert", "");
  joinEmail?.focus();
}

document.querySelectorAll("[data-form]").forEach((btn) => {
  btn.addEventListener("click", () => openJoin(btn.getAttribute("data-form"), btn));
});

joinOverlay?.querySelector(".form-close")?.addEventListener("click", closeJoin);
joinOverlay?.addEventListener("click", (e) => {
  if (e.target === joinOverlay) closeJoin();
});
document.addEventListener("keydown", (e) => {
  if (!joinOverlay || joinOverlay.hidden) return;
  if (e.key === "Escape") {
    closeJoin();
    return;
  }
  if (e.key !== "Tab") return;
  const nodes = joinFocusables();
  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});
window.addEventListener("pehuer-lang", () => {
  if (joinKey && joinSubject && joinOverlay && !joinOverlay.hidden) {
    joinSubject.value = t(joinKey);
  }
});

joinForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = joinEmail.value.trim();
  const message = joinMessage.value.trim();
  const subject = joinSubject.value.trim();
  if (!email || !message || !subject) {
    setJoinStatus("err", t("form.err"));
    return;
  }
  if (joinSubmit) joinSubmit.disabled = true;
  setJoinStatus("", t("form.sending"));
  try {
    const res = await fetch("https://formsubmit.co/ajax/info@pehuer.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email,
        _replyto: email,
        _subject: subject,
        message,
        opcion: subject,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === "false") throw new Error("send");
    setJoinStatus("ok", t("form.ok"));
    joinForm.reset();
    joinSubject.value = t(joinKey);
  } catch (_) {
    setJoinStatus("err", t("form.err"));
  } finally {
    if (joinSubmit) joinSubmit.disabled = false;
  }
});

function matches(r, q) {
  const blob = [r.name, refText(r, "tipo"), r.agencia, refText(r, "origen"), refText(r, "detalle"), r.kind, r.misiones, r.anio, refText(r, "fuente")]
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
    const inc = r.inclinacion != null ? "i = " + Number(r.inclinacion).toLocaleString(loc) + "°" : refText(r, "tipo");
    const alt =
      r.perilune_km != null && r.apolune_km != null
        ? r.perilune_km.toLocaleString(loc) + " × " + r.apolune_km.toLocaleString(loc) + " km"
        : r.altitud_km != null
          ? "h ≈ " + r.altitud_km + " km"
          : "";
    const used = r.misiones
      ? t("moon.meta.missions", { v: r.misiones })
      : t("moon.meta.orbitClass");
    const src = refText(r, "fuente") ? t("moon.meta.source", { v: refText(r, "fuente") }) : "";
    return [refText(r, "tipo"), inc, alt, used, src].filter(Boolean).join(" · ");
  }
  if (r.kind === "mision") {
    const crew = r.tripulada ? t("moon.meta.crew") : t("moon.meta.uncrewed");
    const src = refText(r, "fuente") ? t("moon.meta.source", { v: refText(r, "fuente") }) : "";
    return [r.agencia || refText(r, "tipo"), crew, fmtCoord(r), src].filter(Boolean).join(" · ");
  }
  if (r.kind === "dato") {
    const src = refText(r, "fuente") ? t("moon.meta.source", { v: refText(r, "fuente") }) : "";
    return [refText(r, "tipo"), r.agencia, refText(r, "origen"), src].filter(Boolean).join(" · ");
  }
  const src = refText(r, "fuente") ? t("moon.meta.source", { v: refText(r, "fuente") }) : "";
  return [refText(r, "tipo"), fmtCoord(r), src].filter(Boolean).join(" · ");
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
    moon = createMoonGlobe(canvas, {
      pinScale: 0.12,
      autoStart: false,
      moonMap: `${ROOT}/assets/moon-hi.jpg`,
      pinMap: `${ROOT}/assets/mark.png?v=5`,
      demMap: `${ROOT}/assets/moon-dem.png`,
    });
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

fetch(`${ROOT}/data/refs.json`)
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

async function startDemo() {
  const root = document.getElementById("sys-demo");
  if (!root || demo || demoStarting) return;
  demoStarting = true;
  try {
    const { createSysDemo } = await import(DEMO_MOD);
    demo = createSysDemo(root);
    const onSys = document.querySelector('[data-panel="servicios"]').classList.contains("is-active");
    demo.setPaused(!onSys);
  } catch (err) {
    console.error(err);
  }
}

function scheduleHero() {
  if (hero || heroStarting) return;
  const run = () => startHero();
  if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 1500 });
  else setTimeout(run, 50);
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
      moonMap: `${ROOT}/assets/moon-hi.jpg`,
      pinMap: `${ROOT}/assets/mark.png?v=5`,
    });
    if (refs.length) hero.setRefs(tourRefs(true));
    hero.resize();
    const onHome = document.querySelector('[data-panel="home"]').classList.contains("is-active");
    setHeroActive(onHome);
    hero.ready.then(() => {
      hero.resize();
    }).catch(() => {});
  } catch (err) {
    console.error(err);
  }
}
