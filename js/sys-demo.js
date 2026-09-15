import { t as tr, locale } from "./i18n.js";

const SH_LAT = -89.67;
const SH_LON = 129.78;
const R_MOON_KM = 1737.4;
const PX_PER_M = 2.8;
const OX = 600;
const OY = 400;
const PERIOD = 18;
const THRESHOLD_M = 22;
const GOOD = { e: 48, n: 28 };
const BAD = { e: 62, n: -18 };

function fmtUtc(d) {
  const y = d.getUTCFullYear();
  const start = Date.UTC(y, 0, 0);
  const doy = String(Math.floor((d.getTime() - start) / 86400000)).padStart(3, "0");
  const hms = d.toISOString().slice(11, 21);
  return `${y}-${doy}  ${hms} UTC`;
}

function svgFromMeters(e, n) {
  return { x: OX + e * PX_PER_M, y: OY - n * PX_PER_M };
}

function toLatLon(e, n) {
  const dlat = (n / 1000 / R_MOON_KM) * (180 / Math.PI);
  const cosLat = Math.cos((SH_LAT * Math.PI) / 180);
  const dlon = cosLat !== 0 ? (e / 1000 / (R_MOON_KM * cosLat)) * (180 / Math.PI) : 0;
  return { lat: SH_LAT + dlat, lon: SH_LON + dlon };
}

function fmtLat(lat) {
  return `${Math.abs(lat).toFixed(5)}°${lat < 0 ? "S" : "N"}`;
}

function fmtLon(lon) {
  let l = lon;
  if (l > 180) l -= 360;
  if (l < -180) l += 360;
  return `${Math.abs(l).toFixed(2)}°${l < 0 ? "W" : "E"}`;
}

function fmtM(v, loc) {
  const sign = v >= 0 ? "+" : "−";
  return `${sign}${Math.abs(v).toLocaleString(loc, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} m`;
}

function fmtAbsM(v, loc) {
  return `${v.toLocaleString(loc, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} m`;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function phaseU(t) {
  const x = (((t % PERIOD) + PERIOD) % PERIOD) / PERIOD;
  return x < 0.5 ? x * 2 : 2 - x * 2;
}

function pathAt(u) {
  return {
    e: GOOD.e + (BAD.e - GOOD.e) * u,
    n: GOOD.n + (BAD.n - GOOD.n) * u,
  };
}

export function createSysDemo(root) {
  const roverG = root.querySelector("#sys-a1");
  const aforoEl = root.querySelector("#sys-aforo");
  const est = root.querySelector("#sys-est");
  const track = root.querySelector("#sys-path");
  const lblAsset = root.querySelector("#sys-lbl-asset");
  const links = root.querySelector("#sys-links");
  const utcEl = root.querySelector("#sys-demo-utc");
  const posEl = root.querySelector("#sys-out-pos");
  const localEl = root.querySelector("#sys-out-local");
  const pehEl = root.querySelector("#sys-out-pehuer");
  const verdictEl = root.querySelector("#sys-out-verdict");
  const thresholdEl = root.querySelector("#sys-out-threshold");
  const headEl = root.querySelector("#sys-out-headroom");
  const assets = [...root.querySelectorAll(".sys-asset")];
  const reduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let t0 = performance.now();
  let elapsed = 0;
  let paused = true;
  let raf = 0;
  let lastTelMs = -2000;

  if (track) {
    const a = svgFromMeters(GOOD.e, GOOD.n);
    const b = svgFromMeters(BAD.e, BAD.n);
    track.setAttribute("d", `M${a.x} ${a.y} L${b.x} ${b.y}`);
  }

  assets.forEach((b) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", b.getAttribute("data-x"));
    line.setAttribute("y1", b.getAttribute("data-y"));
    line.setAttribute("x2", String(OX));
    line.setAttribute("y2", String(OY));
    links.appendChild(line);
    b._line = line;
  });

  function pose(t) {
    const u = clamp01(phaseU(t));
    const { e, n } = pathAt(u);
    const aforo = 13 + 15 * u;
    const leave = clamp01((aforo - 16) / 8);
    const sep = aforo * (0.22 + 1.12 * leave);
    const estE = e;
    const estN = n + sep;
    const inside = sep <= aforo;
    const ok = inside && aforo <= THRESHOLD_M;
    const head = THRESHOLD_M - aforo;
    const p = svgFromMeters(e, n);
    const estP = svgFromMeters(estE, estN);
    if (roverG) {
      roverG.setAttribute("transform", `translate(${p.x} ${p.y})`);
      roverG.classList.toggle("is-bad", !ok);
    }
    if (est) {
      est.setAttribute("cx", estP.x);
      est.setAttribute("cy", estP.y);
    }
    if (aforoEl) {
      aforoEl.setAttribute("cx", estP.x);
      aforoEl.setAttribute("cy", estP.y);
      aforoEl.setAttribute("r", String(Math.max(36, aforo * PX_PER_M)));
      aforoEl.setAttribute("class", ok ? "is-ok" : "is-bad");
    }
    if (lblAsset) {
      lblAsset.setAttribute("x", p.x - 72);
      lblAsset.setAttribute("y", p.y - 28);
    }
    assets.forEach((b) => {
      b._line.setAttribute("x2", p.x);
      b._line.setAttribute("y2", p.y);
    });

    if (utcEl) utcEl.textContent = fmtUtc(new Date());
    const nowMs = performance.now();
    if (reduced || nowMs - lastTelMs >= 400) {
      lastTelMs = nowMs;
      const loc = locale();
      const { lat, lon } = toLatLon(e, n);
      const verdict = tr(ok ? "sys.demo.v.ok" : "sys.demo.v.bad");
      if (posEl) posEl.textContent = `${fmtLat(lat)}   ${fmtLon(lon)}`;
      if (localEl) localEl.textContent = `E ${fmtM(e, loc)}    N ${fmtM(n, loc)}`;
      if (pehEl) {
        pehEl.textContent = fmtAbsM(aforo, loc);
        pehEl.classList.toggle("is-ok", ok);
        pehEl.classList.toggle("is-bad", !ok);
      }
      if (thresholdEl) thresholdEl.textContent = fmtAbsM(THRESHOLD_M, loc);
      if (headEl) {
        const sign = head >= 0 ? "+" : "−";
        headEl.textContent = `${sign}${fmtAbsM(Math.abs(head), loc)}`;
        headEl.classList.toggle("is-ok", ok);
        headEl.classList.toggle("is-bad", !ok);
      }
      if (verdictEl) {
        verdictEl.textContent = verdict;
        verdictEl.classList.toggle("is-ok", ok);
        verdictEl.classList.toggle("is-bad", !ok);
      }
    }
  }

  function tick(now) {
    if (paused) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(tick);
    pose(reduced ? elapsed / 1000 : (now - t0) / 1000);
  }

  function setPaused(next) {
    paused = !!next;
    if (paused) {
      if (raf) elapsed = performance.now() - t0;
      cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    t0 = performance.now() - elapsed;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  pose(elapsed / 1000);

  return {
    setPaused,
    dispose() {
      setPaused(true);
    },
  };
}
