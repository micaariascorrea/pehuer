const KEY = "pehuer-lang";

export const STRINGS = {
  es: {
    "meta.title": "PEHUER — Software para posicionamiento lunar",
    "meta.description":
      "Somos PEHUER. Construimos software para el posicionamiento en la superficie lunar. Desde Argentina.",
    "nav.sections": "Secciones",
    "nav.lang": "Idioma",
    "nav.home": "Home",
    "nav.sistema": "Sistema",
    "nav.moon": "Moon",
    "nav.contacto": "Contacto",
    "home.intro1":
      "Somos PEHUER. Construimos software para el posicionamiento en la superficie lunar, sobre la infraestructura de navegación y comunicaciones en despliegue.",
    "home.intro2":
      "Sostenemos el servicio con el Marco Cuantitativo: describimos cómo se estima una posición lunar y cómo se cuantifica el riesgo de esa estimación. La estadística que ya maduró en las finanzas cuantitativas —factores de riesgo y medición de cola— es complementaria a la navegación lunar.",
    "home.intro3":
      "Sobre la infraestructura de comunicaciones y navegación que despliegan las agencias, aportamos dos capacidades que aún no existen como producto independiente: una corrección de red que aísla y descuenta el error sistemático compartido entre activos, y la traducción de esa precisión a un veredicto operativo de riesgo, con el criterio de medición propio de los mercados financieros.",
    "home.aims": "Objetivo",
    "home.obj1.title": "Estimación de posición",
    "home.obj1.body":
      "Fusionamos las fuentes disponibles a lo largo del tiempo y modelamos la estructura del error, incluido el componente compartido entre activos cercanos.",
    "home.obj2.title": "Veredicto de riesgo",
    "home.obj2.body":
      "Traducimos esa lectura a un veredicto sobre esta posición: RIESGO ACEPTABLE o RIESGO EXCEDIDO. El umbral es parametrizable por cada cliente.",
    "home.roadmap.kicker": "Hoja de ruta",
    "home.roadmap.title": "Roadmap",
    "home.step1.title": "Simulador",
    "home.step1.body":
      "Brindamos un entorno de simulación para universidades y otros proyectos que ensayan la capa de posición.",
    "home.step2.title": "Sistema PEHUER",
    "home.step2.body": "Entregamos el software a clientes: estimación, incertidumbre y veredicto.",
    "home.step3.title": "Balizas en la Luna",
    "home.step3.body": "Desplegamos balizas en la Luna para mejorar la precisión del sistema.",
    "home.step4.title": "Simulador Marte",
    "home.step4.body": "Extendemos el entorno de simulación al caso marciano.",
    "home.step5.title": "Balizas con cámaras",
    "home.step5.body":
      "Evolucionamos la red de balizas con captura visual de apoyo al posicionamiento.",
    "home.step6.title": "Balizas en Marte",
    "home.step6.body": "Expandimos la misma lógica de red más allá de la Luna.",
    "sys.title": "Sistema PEHUER",
    "sys.lede":
      "Proveemos una lectura de posicionamiento estructurada: dónde está el activo, con qué margen y con qué veredicto de riesgo.",
    "sys.pos.title": "Posición estimada",
    "sys.pos.body":
      "Estimamos dónde está el activo, en el marco de referencia declarado, a partir de las observaciones disponibles.",
    "sys.unc.title": "Incertidumbre",
    "sys.unc.body":
      "Brindamos el margen con el que la operación trabaja sobre esa estimación: una lectura de confianza para decidir.",
    "sys.ver.title": "Veredicto",
    "sys.ver.body":
      "RIESGO ACEPTABLE o RIESGO EXCEDIDO, sobre esta posición. El umbral es parametrizable por cada cliente.",
    "sys.obs.title": "Observaciones",
    "sys.obs.body":
      "Admitimos las mediciones y las efemérides de trabajo que el integrador ya opera.",
    "sys.api.kicker": "APIs",
    "sys.api.title": "Brindamos una API por cada objetivo",
    "sys.api.1": "API de estimación de posición",
    "sys.api.2": "API de incertidumbre",
    "sys.api.3": "API de riesgo de la lectura",
    "sys.api.4": "API de veredicto de riesgo",
    "sys.api.5": "API de ingestión de observaciones",
    "sys.api.6": "API de marco de referencia y época",
    "moon.title": "Referencias",
    "moon.hint":
      "Solo seis misiones tripuladas alunizaron (Apollo 11, 12, 14, 15, 16 y 17). El resto son robóticas. Órbitas y lugares indican su fuente.",
    "moon.search": "Buscar cráter, misión, órbita, IBM…",
    "moon.loading": "Cargando globo lunar…",
    "moon.fail": "No se pudo iniciar el globo 3D.",
    "moon.refsFail": "No se pudieron cargar las referencias",
    "moon.preparing": "Preparando el globo…",
    "moon.canvas": "Globo 3D de la Luna",
    "moon.count.one": "{n} coincidencia",
    "moon.count.many": "{n} coincidencias",
    "moon.count.all": "{n} marcas",
    "moon.kind.lugar": "Lugar",
    "moon.kind.crew": "Misión tripulada",
    "moon.kind.uncrewed": "Misión no tripulada",
    "moon.kind.orbita": "Órbita",
    "moon.kind.dato": "Capa de datos",
    "moon.kind.lugar.lc": "lugar",
    "moon.kind.crew.lc": "misión tripulada",
    "moon.kind.uncrewed.lc": "misión no tripulada",
    "moon.kind.orbita.lc": "órbita",
    "moon.kind.dato.lc": "capa de datos",
    "moon.meta.crew": "tripulada",
    "moon.meta.uncrewed": "no tripulada",
    "moon.meta.source": "fuente: {v}",
    "moon.meta.missions": "misiones: {v}",
    "moon.meta.orbitClass": "clase de órbita (sin misión única)",
    "moon.tip.type": "tipo: {v}",
    "moon.tip.agency": "agencia: {v}",
    "moon.tip.origin": "origen: {v}",
    "moon.tip.source": "fuente: {v}",
    "moon.tip.missions": "misiones en esta órbita: {v}",
    "moon.tip.orbitClass": "clase de órbita (no es una misión)",
    "moon.status.crew": "Tripulada · {name}",
    "moon.status.uncrewed": "No tripulada · {name}",
    "moon.status.orbit": "Órbita · {name}",
    "moon.status.data": "Capa de datos · {name}",
    "contact.tag": "Brindamos software para posicionamiento lunar.",
    "contact.from": "Desde Argentina",
    "contact.footer": "Contacto · @pehuer.space",
    "footer.copy": "© 2026 PEHUER SPACE. Todos los derechos reservados.",
  },
  en: {
    "meta.title": "PEHUER — Software for lunar positioning",
    "meta.description":
      "We are PEHUER. We build software for positioning on the lunar surface. From Argentina.",
    "nav.sections": "Sections",
    "nav.lang": "Language",
    "nav.home": "Home",
    "nav.sistema": "System",
    "nav.moon": "Moon",
    "nav.contacto": "Contact",
    "home.intro1":
      "We are PEHUER. We build software for positioning on the lunar surface, on the navigation and communications infrastructure now being deployed.",
    "home.intro2":
      "We underpin the service with the Quantitative Framework: we describe how a lunar position is estimated and how the risk of that estimate is quantified. Statistics that already matured in quantitative finance — risk factors and tail measurement — complement lunar navigation.",
    "home.intro3":
      "On the communications and navigation infrastructure deployed by the agencies, we provide two capabilities that do not yet exist as a standalone product: a network correction that isolates and subtracts the systematic error shared among assets, and the translation of that precision into an operational risk verdict, with the measurement criteria of financial markets.",
    "home.aims": "Purpose",
    "home.obj1.title": "Position estimate",
    "home.obj1.body":
      "We fuse the available sources over time and model the structure of the error, including the component shared among nearby assets.",
    "home.obj2.title": "Risk verdict",
    "home.obj2.body":
      "We translate that reading into a verdict on this position: ACCEPTABLE RISK or EXCEEDED RISK. The threshold is parametrizable for each client.",
    "home.roadmap.kicker": "Roadmap",
    "home.roadmap.title": "Roadmap",
    "home.step1.title": "Simulator",
    "home.step1.body":
      "We provide a simulation environment for universities and other projects rehearsing the position layer.",
    "home.step2.title": "PEHUER system",
    "home.step2.body": "We deliver the software to clients: estimate, uncertainty and verdict.",
    "home.step3.title": "Beacons on the Moon",
    "home.step3.body": "We deploy lunar beacons to improve the precision of the system.",
    "home.step4.title": "Mars simulator",
    "home.step4.body": "We extend the simulation environment to the Martian case.",
    "home.step5.title": "Beacons with cameras",
    "home.step5.body":
      "We evolve the beacon network with visual capture in support of positioning.",
    "home.step6.title": "Beacons on Mars",
    "home.step6.body": "We expand the same network logic beyond the Moon.",
    "sys.title": "PEHUER system",
    "sys.lede":
      "We provide a structured positioning reading: where the asset is, with what margin, and with what risk verdict.",
    "sys.pos.title": "Estimated position",
    "sys.pos.body":
      "We estimate where the asset is, in the declared reference frame, from the observations available.",
    "sys.unc.title": "Uncertainty",
    "sys.unc.body":
      "We provide the margin the operation works with on that estimate: a confidence reading for the decision.",
    "sys.ver.title": "Verdict",
    "sys.ver.body":
      "ACCEPTABLE RISK or EXCEEDED RISK, on this position. The threshold is parametrizable for each client.",
    "sys.obs.title": "Observations",
    "sys.obs.body":
      "We accept the measurements and working ephemerides the integrator already operates.",
    "sys.api.kicker": "APIs",
    "sys.api.title": "We provide an API for each objective",
    "sys.api.1": "Position-estimate API",
    "sys.api.2": "Uncertainty API",
    "sys.api.3": "Reading-risk API",
    "sys.api.4": "Risk-verdict API",
    "sys.api.5": "Observation-ingest API",
    "sys.api.6": "Reference-frame and epoch API",
    "moon.title": "References",
    "moon.hint":
      "Only six crewed missions landed (Apollo 11, 12, 14, 15, 16 and 17). The rest are robotic. Orbits and sites cite their source.",
    "moon.search": "Search crater, mission, orbit, IBM…",
    "moon.loading": "Loading lunar globe…",
    "moon.fail": "The 3D globe could not be started.",
    "moon.refsFail": "References could not be loaded",
    "moon.preparing": "Preparing the globe…",
    "moon.canvas": "3D globe of the Moon",
    "moon.count.one": "{n} match",
    "moon.count.many": "{n} matches",
    "moon.count.all": "{n} markers",
    "moon.kind.lugar": "Site",
    "moon.kind.crew": "Crewed mission",
    "moon.kind.uncrewed": "Uncrewed mission",
    "moon.kind.orbita": "Orbit",
    "moon.kind.dato": "Data layer",
    "moon.kind.lugar.lc": "site",
    "moon.kind.crew.lc": "crewed mission",
    "moon.kind.uncrewed.lc": "uncrewed mission",
    "moon.kind.orbita.lc": "orbit",
    "moon.kind.dato.lc": "data layer",
    "moon.meta.crew": "crewed",
    "moon.meta.uncrewed": "uncrewed",
    "moon.meta.source": "source: {v}",
    "moon.meta.missions": "missions: {v}",
    "moon.meta.orbitClass": "orbit class (not a single mission)",
    "moon.tip.type": "type: {v}",
    "moon.tip.agency": "agency: {v}",
    "moon.tip.origin": "origin: {v}",
    "moon.tip.source": "source: {v}",
    "moon.tip.missions": "missions in this orbit: {v}",
    "moon.tip.orbitClass": "orbit class (not a mission)",
    "moon.status.crew": "Crewed · {name}",
    "moon.status.uncrewed": "Uncrewed · {name}",
    "moon.status.orbit": "Orbit · {name}",
    "moon.status.data": "Data layer · {name}",
    "contact.tag": "We provide software for lunar positioning.",
    "contact.from": "From Argentina",
    "contact.footer": "Contact · @pehuer.space",
    "footer.copy": "© 2026 PEHUER SPACE. All rights reserved.",
  },
};

let lang = "es";

function readStored() {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "en" || v === "es") return v;
  } catch (_) {}
  return "es";
}

lang = readStored();

export function getLang() {
  return lang;
}

export function t(key, vars) {
  const table = STRINGS[lang] || STRINGS.es;
  let s = table[key] ?? STRINGS.es[key] ?? key;
  if (vars) {
    s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : ""));
  }
  return s;
}

export function locale() {
  return lang === "en" ? "en-US" : "es-AR";
}

export function apply() {
  document.documentElement.lang = lang;
  document.title = t("meta.title");
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", t("meta.description"));
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
  });
  document.querySelectorAll("[data-set-lang]").forEach((btn) => {
    const on = btn.getAttribute("data-set-lang") === lang;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

export function setLang(next) {
  if (next !== "en" && next !== "es") return;
  lang = next;
  try {
    localStorage.setItem(KEY, lang);
  } catch (_) {}
  apply();
  window.dispatchEvent(new CustomEvent("pehuer-lang", { detail: lang }));
}
