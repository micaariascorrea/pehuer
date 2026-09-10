import { createMoonGlobe } from "./moon-globe.js";

const TABS = ["home", "sistema", "moon", "contacto"];

const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll("[data-panel]")];
const search = document.getElementById("ref-search");
const listEl = document.getElementById("ref-list");
const countEl = document.getElementById("ref-count");
const canvas = document.getElementById("moon-canvas");
const loader = document.getElementById("moon-loader");
const loaderText = document.getElementById("moon-loader-text");
const status = document.getElementById("moon-status");

let refs = [];
let filtered = [];
let highlight = 0;
let activeI = null;
let moon = null;
let moonReady = false;
let moonStarting = false;
let pendingFly = null;
let statusTimer = 0;

function fold(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function openTab(id) {
  if (!TABS.includes(id)) id = "home";
  tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.tab === id));
  panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === id));
  if (location.hash.slice(1) !== id) {
    history.replaceState(null, "", "#" + id);
  }
  if (id === "moon") {
    if (search) search.focus({ preventScroll: true });
    startMoon();
    requestAnimationFrame(() => moon && moon.resize());
  }
}

tabs.forEach((btn) => {
  btn.addEventListener("click", () => openTab(btn.dataset.tab));
});

window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (TABS.includes(id)) openTab(id);
});

function matches(r, q) {
  const blob = [r.name, r.tipo, r.agencia, r.origen, r.detalle, r.kind, r.misiones, r.anio, r.fuente]
    .filter((v) => v != null && v !== "")
    .join(" ");
  return fold(blob).includes(q);
}

function kindLabel(r) {
  if (r.kind === "mision") return r.tripulada ? "Misión tripulada" : "Misión no tripulada";
  if (r.kind === "orbita") return "Órbita";
  if (r.kind === "dato") return "Capa de datos";
  return "Lugar";
}

function renderList() {
  const q = fold(search.value.trim());
  filtered = q ? refs.filter((r) => matches(r, q)) : refs.slice();

  countEl.textContent = q
    ? `${filtered.length} coincidencia${filtered.length === 1 ? "" : "s"}`
    : `${refs.length} marcas`;

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
    const inc = r.inclinacion != null ? "i = " + String(r.inclinacion).replace(".", ",") + "°" : r.tipo;
    const alt =
      r.perilune_km != null && r.apolune_km != null
        ? r.perilune_km.toLocaleString("es-AR") + " × " + r.apolune_km.toLocaleString("es-AR") + " km"
        : r.altitud_km != null
          ? "h ≈ " + r.altitud_km + " km"
          : "";
    const used = r.misiones
      ? "misiones: " + r.misiones
      : "clase de órbita (sin misión única)";
    const src = r.fuente ? "fuente: " + r.fuente : "";
    return [r.tipo, inc, alt, used, src].filter(Boolean).join(" · ");
  }
  if (r.kind === "mision") {
    const crew = r.tripulada ? "tripulada" : "no tripulada";
    const src = r.fuente ? "fuente: " + r.fuente : "";
    return [r.agencia || r.tipo, crew, fmtCoord(r), src].filter(Boolean).join(" · ");
  }
  if (r.kind === "dato") {
    const src = r.fuente ? "fuente: " + r.fuente : "";
    return [r.tipo, r.agencia, r.origen, src].filter(Boolean).join(" · ");
  }
  const src = r.fuente ? "fuente: " + r.fuente : "";
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
    const crew = r.tripulada ? "Tripulada" : "No tripulada";
    return r.anio ? `${crew} · ${r.name} · ${r.anio}` : `${crew} · ${r.name}`;
  }
  if (r.kind === "orbita") return `Órbita · ${r.name}`;
  if (r.kind === "dato") {
    return r.anio ? `Capa de datos · ${r.name} · ${r.anio}` : `Capa de datos · ${r.name}`;
  }
  return r.name;
}

async function startMoon() {
  if (moon || moonStarting) return;
  moonStarting = true;
  try {
    moon = createMoonGlobe(canvas);
    moon.setRefs(refs);
    moon.resize();
    try {
      await moon.ready;
    } catch (_) {}
    moonReady = true;
    loader.classList.add("is-hide");
    moon.resize();
    if (pendingFly) {
      const r = pendingFly;
      pendingFly = null;
      fly(r);
    }
  } catch (err) {
    if (loaderText) {
      loaderText.textContent = "No se pudo iniciar el globo 3D.";
    }
    console.error(err);
  }
}

function fly(r) {
  activeI = r.i;
  if (!moonReady) {
    pendingFly = r;
    startMoon();
    showStatus("Preparando el globo…");
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
openTab(TABS.includes(initial) ? initial : "home");

fetch("data/refs.json")
  .then((r) => r.json())
  .then((data) => {
    refs = data;
    renderList();
    if (moon) moon.setRefs(refs);
  })
  .catch(() => {
    countEl.textContent = "No se pudieron cargar las referencias";
  });
