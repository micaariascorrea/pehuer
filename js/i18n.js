const KEY = "pehuer-lang";

export const STRINGS = {
  es: {
    "meta.title": "PEHUER — Software para posicionamiento lunar",
    "meta.description":
      "Somos PEHUER. Construimos software para el posicionamiento en la superficie lunar. Desde Argentina.",
    "nav.sections": "Secciones",
    "nav.lang": "Idioma",
    "nav.home": "Inicio",
    "nav.servicios": "Servicios",
    "nav.moon": "Luna",
    "nav.unite": "Sumate",
    "nav.contacto": "Contacto",
    "home.intro1":
      "Software para el posicionamiento en la superficie lunar, sobre la infraestructura de navegación y comunicaciones en despliegue.",
    "home.intro2":
      "Sostenemos el servicio con el Marco Cuantitativo: describimos cómo se estima una posición lunar y cómo se cuantifica el riesgo de esa estimación. La estadística que ya maduró en las finanzas cuantitativas es complementaria a la navegación lunar.",
    "home.intro3":
      "Sobre la infraestructura de comunicaciones y navegación que despliegan las agencias, aportamos dos capacidades que aún no existen como producto independiente: una corrección de red que aísla y descuenta el error sistemático compartido entre activos, y la traducción de esa precisión a un veredicto operativo de riesgo, con el criterio de medición propio de los mercados financieros.",
    "home.aims": "Objetivo",
    "home.obj1.title": "Estimación de posición",
    "home.obj1.body":
      "Fusionamos las fuentes disponibles a lo largo del tiempo y modelamos la estructura del error, incluido el componente compartido entre activos cercanos.",
    "home.obj2.title": "Veredicto de riesgo",
    "home.obj2.body":
      "Traducimos esa lectura a un veredicto sobre esta posición: RIESGO ACEPTABLE o RIESGO EXCEDIDO. El umbral es parametrizable por cada cliente.",
    "home.roadmap.title": "Roadmap",
    "home.step1.title": "SDK y APIs",
    "home.step1.body":
      "Software para integrar en diferentes tipos de misiones. Mejora precisión y tiempo, combinando señales, mapa disponible y datos de riesgo PEHUER.",
    "home.step2.title": "Simulador",
    "home.step2.body":
      "Entorno para diseñar, validar y entrenar misiones lunares previas a la ejecución.",
    "home.step3.title": "Entorno de Red",
    "home.step3.body":
      "Cada activo que usa PEHUER aporta y recibe correcciones cruzadas. La red mejora con cada misión: cuantos más activos, más precisa para todos.",
    "sys.title": "Servicios PEHUER",
    "tour.30.desc": "Primer alunizaje tripulado, 1969.",
    "tour.80.desc": "Carroll cráter lunar nombrado provisionalmente por la tripulación de Artemis II 2026 en honor a Carroll Taylor Wiseman, la difunta esposa del comandante Reid Wiseman.",
    "tour.35.desc": "Último alunizaje tripulado, 1972.",
    "tour.4.desc": "Cráter del polo sur, referencia de las misiones actuales.",
    "tour.18.desc": "Cráter de rayos; Surveyor 7 alunizó en su borde norte.",
    "sys.lede": "Proveemos una lectura de posicionamiento estructurada:",
    "sys.pos.title": "Posición estimada",
    "sys.pos.body":
      "Estimamos dónde está el activo, en el marco de referencia declarado, a partir de las observaciones disponibles.",
    "sys.unc.title": "Incertidumbre",
    "sys.unc.body":
      "Brindamos el margen con el que la operación trabaja sobre esa estimación: una lectura de confianza para decidir.",
    "sys.ver.title": "Veredicto",
    "sys.ver.body":
      "RIESGO ACEPTABLE o RIESGO EXCEDIDO, sobre esta posición. El umbral es parametrizable por cada cliente.",
    "sys.integ.title": "Integración",
    "sys.integ.in": "Input",
    "sys.integ.in.1": "Observaciones",
    "sys.integ.in.2": "Marco de referencia de la misión",
    "sys.integ.in.3": "Umbral de riesgo parametrizado",
    "sys.integ.out": "Output",
    "sys.integ.out.1": "Posición del activo",
    "sys.integ.out.2": "Aforo",
    "sys.integ.out.3": "Veredicto de riesgo sobre la posición",
    "sys.demo.alt": "Demo del sistema PEHUER en el polo sur lunar, con activos y referencias mapeadas.",
    "sys.demo.place": "Polo sur · Shackleton",
    "sys.demo.live": "EN LÍNEA",
    "sys.demo.v.ok": "RIESGO ACEPTABLE",
    "sys.demo.v.bad": "RIESGO EXCEDIDO",
    "sys.demo.pehuer": "Aforo PEHUER",
    "sys.demo.threshold": "umbral del cliente",
    "sys.demo.headroom": "margen del umbral",
    "sys.demo.zone.kicker": "Zona de operación",
    "sys.demo.zone": "Shackleton",
    "sys.demo.asset1": "ACTIVO 1",
    "sys.demo.asset2": "ACTIVO 2",
    "sys.demo.asset3": "ACTIVO 3",
    "sys.demo.asset4": "ACTIVO 4",
    "sys.demo.asset5": "ACTIVO 5",
    "moon.title": "Referencias y sus fuentes",
    "moon.search": "Buscar cráter, órbita o misión",
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
    "hero.spirit": "Explorar para ser libres",
    "hero.credit": "NASA",
    "hero.caption": "{name}",
    "unite.kicker": "Comunidad",
    "unite.title": "Sumate a PEHUER",
    "unite.lede": "Construimos PEHUER juntos. Elegí cómo querés sumarte.",
    "unite.community.title": "Comunidad",
    "unite.community.body":
      "Sumate a la comunidad para crear PEHUER juntos: talento, ideas y trabajo compartido.",
    "unite.community.cta": "Quiero unirme",
    "unite.investor.title": "Inversor",
    "unite.investor.body":
      "Si querés invertir en correr los límites del desarrollo de la humanidad y sus conocimientos, escribinos.",
    "unite.investor.cta": "Quiero invertir",
    "unite.partner.title": "Socio estratégico",
    "unite.partner.body": "Buscamos socios estratégicos para integrar, desplegar y escalar el servicio.",
    "unite.partner.cta": "Quiero ser socio",
    "contact.tag": "Brindamos software para posicionamiento lunar.",
    "contact.from": "Desde Argentina",
    "contact.footer": "Contacto · @pehuer.space",
    "footer.copy": "© PEHUER SPACE. Todos los derechos reservados.",
  },
  en: {
    "meta.title": "PEHUER — Software for lunar positioning",
    "meta.description":
      "We are PEHUER. We build software for positioning on the lunar surface. From Argentina.",
    "nav.sections": "Sections",
    "nav.lang": "Language",
    "nav.home": "Home",
    "nav.servicios": "Services",
    "nav.moon": "Moon",
    "nav.unite": "Join as",
    "nav.contacto": "Contact",
    "home.intro1":
      "Software for positioning on the lunar surface, on the navigation and communications infrastructure now being deployed.",
    "home.intro2":
      "We underpin the service with the Quantitative Framework: we describe how a lunar position is estimated and how the risk of that estimate is quantified. Statistics that already matured in quantitative finance complement lunar navigation.",
    "home.intro3":
      "On the communications and navigation infrastructure deployed by the agencies, we provide two capabilities that do not yet exist as a standalone product: a network correction that isolates and subtracts the systematic error shared among assets, and the translation of that precision into an operational risk verdict, with the measurement criteria of financial markets.",
    "home.aims": "Purpose",
    "home.obj1.title": "Position estimate",
    "home.obj1.body":
      "We fuse the available sources over time and model the structure of the error, including the component shared among nearby assets.",
    "home.obj2.title": "Risk verdict",
    "home.obj2.body":
      "We translate that reading into a verdict on this position: RISK ACCEPTABLE or RISK EXCEEDED. The threshold is parametrizable for each client.",
    "home.roadmap.title": "Roadmap",
    "home.step1.title": "SDK and APIs",
    "home.step1.body":
      "Software to integrate into different types of missions. It improves precision and time, combining signals, the available map and PEHUER risk data.",
    "home.step2.title": "Simulator",
    "home.step2.body":
      "Environment to design, validate and train lunar missions before execution.",
    "home.step3.title": "Network environment",
    "home.step3.body":
      "Each asset that uses PEHUER contributes and receives crossed corrections. The network improves with each mission: the more assets, the more precise for everyone.",
    "sys.title": "PEHUER Services",
    "tour.30.desc": "First crewed lunar landing, 1969.",
    "tour.80.desc": "Carroll, a lunar crater provisionally named by the Artemis II crew in 2026 in honor of Carroll Taylor Wiseman, the late wife of commander Reid Wiseman.",
    "tour.35.desc": "Last crewed lunar landing, 1972.",
    "tour.4.desc": "South-pole crater, a reference for current missions.",
    "tour.18.desc": "Ray crater; Surveyor 7 landed on its north rim.",
    "sys.lede": "We provide a structured positioning reading:",
    "sys.pos.title": "Estimated position",
    "sys.pos.body":
      "We estimate where the asset is, in the declared reference frame, from the observations available.",
    "sys.unc.title": "Uncertainty",
    "sys.unc.body":
      "We provide the margin the operation works with on that estimate: a confidence reading for the decision.",
    "sys.ver.title": "Verdict",
    "sys.ver.body":
      "RISK ACCEPTABLE or RISK EXCEEDED, on this position. The threshold is parametrizable for each client.",
    "sys.integ.title": "Integration",
    "sys.integ.in": "Input",
    "sys.integ.in.1": "Observations",
    "sys.integ.in.2": "Mission reference frame",
    "sys.integ.in.3": "Parametrized risk threshold",
    "sys.integ.out": "Output",
    "sys.integ.out.1": "Asset position",
    "sys.integ.out.2": "Aforo",
    "sys.integ.out.3": "Risk verdict on the position",
    "sys.demo.alt": "PEHUER system demo at the lunar south pole, with assets and mapped references.",
    "sys.demo.place": "South pole · Shackleton",
    "sys.demo.live": "LIVE",
    "sys.demo.v.ok": "RISK ACCEPTABLE",
    "sys.demo.v.bad": "RISK EXCEEDED",
    "sys.demo.pehuer": "PEHUER aforo",
    "sys.demo.threshold": "client threshold",
    "sys.demo.headroom": "threshold margin",
    "sys.demo.zone.kicker": "Operating zone",
    "sys.demo.zone": "Shackleton",
    "sys.demo.asset1": "ASSET 1",
    "sys.demo.asset2": "ASSET 2",
    "sys.demo.asset3": "ASSET 3",
    "sys.demo.asset4": "ASSET 4",
    "sys.demo.asset5": "ASSET 5",
    "moon.title": "References and their sources",
    "moon.search": "Search crater, orbit or mission",
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
    "hero.spirit": "Explore to be free",
    "hero.credit": "NASA",
    "hero.caption": "{name}",
    "unite.kicker": "Community",
    "unite.title": "Join PEHUER",
    "unite.lede": "We are building PEHUER together. Choose how you want to take part.",
    "unite.community.title": "Community",
    "unite.community.body":
      "Join the community to build PEHUER together: talent, ideas and shared work.",
    "unite.community.cta": "I want to join",
    "unite.investor.title": "Investor",
    "unite.investor.body":
      "If you want to invest in pushing the limits of humanity’s development and knowledge, write to us.",
    "unite.investor.cta": "I want to invest",
    "unite.partner.title": "Strategic partner",
    "unite.partner.body": "We look for strategic partners to integrate, deploy and scale the service.",
    "unite.partner.cta": "I want to partner",
    "contact.tag": "We provide software for lunar positioning.",
    "contact.from": "From Argentina",
    "contact.footer": "Contact · @pehuer.space",
    "footer.copy": "© PEHUER SPACE. All rights reserved.",
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
    const text = t(el.getAttribute("data-i18n-aria"));
    el.setAttribute("aria-label", text);
    if (el.tagName === "IMG") el.setAttribute("alt", text);
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
