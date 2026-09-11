import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { locale, t } from "./i18n.js";

const RADIUS = 1.85;
const CAM_DIST = 4.15;
const R_MOON_KM = 1737.4;

function latLonToVec3(lat, lon, r = RADIUS) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon);
  const x = r * Math.sin(phi) * Math.sin(theta);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.cos(theta);
  return new THREE.Vector3(x, y, z);
}

function visualRadii(ref) {
  const periKm = ref.perilune_km ?? ref.altitud_km ?? 100;
  const apoKm = ref.apolune_km ?? periKm;
  const periR = RADIUS + Math.min(periKm, 4500) / R_MOON_KM * 0.52;
  let apoR;
  if (apoKm >= 40000) apoR = RADIUS * 2.18;
  else if (apoKm >= 8000) apoR = RADIUS * 1.92;
  else apoR = RADIUS + Math.min(apoKm, 2500) / R_MOON_KM * 0.52;
  return {
    periR: Math.max(periR, RADIUS + 0.035),
    apoR: Math.max(apoR, periR + 0.02),
  };
}

function orbitPosition(ref, nu) {
  const { periR, apoR } = visualRadii(ref);
  const a = (periR + apoR) / 2;
  const e = (apoR - periR) / (apoR + periR);
  const r = a * (1 - e * e) / (1 + e * Math.cos(nu));
  const inc = THREE.MathUtils.degToRad(ref.inclinacion || 0);
  const raan = THREE.MathUtils.degToRad(ref.raan || 0);
  const aop = THREE.MathUtils.degToRad(ref.aop || 0);
  const arg = nu + aop;
  const x0 = r * Math.cos(arg);
  const z0 = r * Math.sin(arg);
  const y1 = -z0 * Math.sin(inc);
  const z1 = z0 * Math.cos(inc);
  const x2 = x0 * Math.cos(raan) + z1 * Math.sin(raan);
  const z2 = -x0 * Math.sin(raan) + z1 * Math.cos(raan);
  return new THREE.Vector3(x2, y1, z2);
}

function orbitNormal(ref) {
  const a = orbitPosition(ref, 0);
  const b = orbitPosition(ref, Math.PI / 2);
  return new THREE.Vector3().crossVectors(a, b).normalize();
}

export function createMoonGlobe(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a1018, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.08, 40);
  camera.position.set(0.7, 0.55, CAM_DIST);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = 2.15;
  controls.maxDistance = 12;
  controls.rotateSpeed = 0.55;

  scene.add(new THREE.AmbientLight(0xb8c4d4, 0.42));
  const sun = new THREE.DirectionalLight(0xfff4e8, 2.15);
  sun.position.set(4.2, 1.4, 2.8);
  scene.add(sun);

  const stars = new THREE.BufferGeometry();
  const starCount = 700;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 12 + Math.random() * 10;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.cos(phi);
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  stars.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  scene.add(
    new THREE.Points(
      stars,
      new THREE.PointsMaterial({ color: 0x8a9bb0, size: 0.018, sizeAttenuation: true })
    )
  );

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(RADIUS, 96, 96),
    new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 1,
      metalness: 0,
    })
  );
  scene.add(moon);

  const pins = new Map();
  const pinGroup = new THREE.Group();
  scene.add(pinGroup);
  const orbits = new Map();
  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);
  const raycaster = new THREE.Raycaster();
  raycaster.params.Mesh = { threshold: 0.08 };
  raycaster.params.Line = { threshold: 0.04 };
  const pointer = new THREE.Vector2();
  const tip = canvas.parentElement.querySelector("#moon-tip");

  function fmtCoord(ref) {
    const ns = ref.lat < 0 ? "S" : "N";
    const ew = ref.lon < 0 ? "W" : "E";
    return (
      Math.abs(ref.lat).toFixed(2) +
      "°" +
      ns +
      " · " +
      Math.abs(ref.lon).toFixed(2) +
      "°" +
      ew
    );
  }

  function fmtOrbit(ref) {
    const loc = locale();
    const inc = ref.inclinacion != null ? "i = " + Number(ref.inclinacion).toLocaleString(loc) + "°" : "";
    let alt = "";
    if (ref.perilune_km != null && ref.apolune_km != null) {
      alt = ref.perilune_km.toLocaleString(loc) + " × " + ref.apolune_km.toLocaleString(loc) + " km";
    } else if (ref.altitud_km != null) {
      alt = "h ≈ " + ref.altitud_km + " km";
    }
    return [inc, alt, ref.periodo].filter(Boolean).join(" · ");
  }

  function setText(sel, text, hideIfEmpty) {
    const el = tip && tip.querySelector(sel);
    if (!el) return;
    el.textContent = text || "";
    if (hideIfEmpty) el.hidden = !text;
  }

  function hideTip() {
    if (tip) tip.hidden = true;
    renderer.domElement.style.cursor = "grab";
  }

  function showTip(ref, clientX, clientY) {
    if (!tip || !ref) return;
    const kicker =
      ref.kind === "mision"
        ? ref.tripulada
          ? t("moon.kind.crew.lc")
          : t("moon.kind.uncrewed.lc")
        : ref.kind === "orbita"
          ? t("moon.kind.orbita.lc")
          : ref.kind === "dato"
            ? t("moon.kind.dato.lc")
            : t("moon.kind.lugar.lc");
    setText(".moon-tip-kicker", kicker, true);
    const title =
      (ref.kind === "mision" || ref.kind === "dato") && ref.anio
        ? ref.name + " · " + ref.anio
        : ref.name;
    tip.querySelector(".moon-tip-name").textContent = title;
    tip.querySelector(".moon-tip-tipo").textContent = t("moon.tip.type", { v: ref.tipo });
    const coordEl = tip.querySelector(".moon-tip-coord");
    if (ref.kind === "orbita") {
      coordEl.textContent = fmtOrbit(ref);
    } else {
      coordEl.textContent = fmtCoord(ref);
    }
    const agencia = ref.agencia ? t("moon.tip.agency", { v: ref.agencia }) : "";
    setText(".moon-tip-agencia", agencia, true);
    let misiones = "";
    if (ref.kind === "orbita") {
      misiones = ref.misiones
        ? t("moon.tip.missions", { v: ref.misiones })
        : t("moon.tip.orbitClass");
    }
    setText(".moon-tip-misiones", misiones, true);
    const origenEl = tip.querySelector(".moon-tip-origen");
    origenEl.textContent = ref.origen ? t("moon.tip.origin", { v: ref.origen }) : "";
    origenEl.hidden = !ref.origen;
    setText(".moon-tip-fuente", ref.fuente ? t("moon.tip.source", { v: ref.fuente }) : "", true);
    setText(".moon-tip-detalle", ref.detalle || "", true);
    const stage = canvas.parentElement.getBoundingClientRect();
    let left = clientX - stage.left + 12;
    let top = clientY - stage.top + 14;
    tip.hidden = false;
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    if (left + tw > stage.width - 8) left = stage.width - tw - 8;
    if (top + th > stage.height - 8) top = stage.height - th - 8;
    if (left < 8) left = 8;
    if (top < 8) top = 8;
    tip.style.transform = "none";
    tip.style.left = left + "px";
    tip.style.top = top + "px";
    renderer.domElement.style.cursor = "pointer";
  }

  function hitRef(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const pinHits = raycaster.intersectObjects(pinGroup.children, true);
    if (pinHits.length) {
      const moonHits = raycaster.intersectObject(moon);
      if (!(moonHits.length && moonHits[0].distance < pinHits[0].distance - 0.01)) {
        let obj = pinHits[0].object;
        while (obj && obj.userData.i == null) obj = obj.parent;
        if (obj) return pins.get(obj.userData.i)?.ref || null;
      }
    }

    const orbitHits = raycaster.intersectObjects(orbitGroup.children, true);
    if (orbitHits.length) {
      let obj = orbitHits[0].object;
      while (obj && obj.userData.i == null) obj = obj.parent;
      if (obj) return orbits.get(obj.userData.i)?.ref || null;
    }
    return null;
  }

  const loader = new THREE.TextureLoader();
  const texPromise = new Promise((resolve, reject) => {
    loader.load(
      "assets/moon-color.jpg",
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        moon.material.map = tex;
        moon.material.bumpMap = tex;
        moon.material.bumpScale = 0.035;
        moon.material.color.set(0xffffff);
        moon.material.needsUpdate = true;
        resolve();
      },
      undefined,
      reject
    );
  });

  let fly = null;
  let selected = null;
  let raf = 0;

  function sizeToStage() {
    const parent = canvas.parentElement;
    const w = Math.max(1, parent.clientWidth);
    const h = Math.max(1, parent.clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function pinColor(ref, selectedNow) {
    if (selectedNow) return 0xf0f1ea;
    if (ref.kind === "mision" && ref.tripulada) return 0xf0f1ea;
    if (ref.kind === "mision") return 0xf0c4a0;
    if (ref.kind === "dato") return 0xe8d4a8;
    return 0xde7a93;
  }

  function makePin(ref, selectedNow) {
    const group = new THREE.Group();
    const bigger = ref.kind === "mision" || ref.kind === "dato";
    const vis = new THREE.Mesh(
      new THREE.SphereGeometry(selectedNow ? 0.03 : bigger ? 0.022 : 0.02, 14, 14),
      new THREE.MeshBasicMaterial({
        color: pinColor(ref, selectedNow),
      })
    );
    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 10, 10),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
    );
    group.add(vis);
    group.add(hit);
    group.position.copy(latLonToVec3(ref.lat, ref.lon, RADIUS + 0.025));
    group.userData.i = ref.i;
    vis.userData.i = ref.i;
    hit.userData.i = ref.i;
    group.userData.vis = vis;
    group.userData.kind = ref.kind;
    return group;
  }

  function makeOrbit(ref) {
    const n = 160;
    const pts = [];
    for (let k = 0; k <= n; k++) {
      pts.push(orbitPosition(ref, (k / n) * Math.PI * 2));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, n, 0.012, 6, true),
      new THREE.MeshBasicMaterial({
        color: 0xde7a93,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      })
    );
    tube.userData.i = ref.i;
    const group = new THREE.Group();
    group.add(tube);
    group.userData.i = ref.i;
    group.userData.tube = tube;
    return group;
  }

  function setRefs(list) {
    pinGroup.clear();
    orbitGroup.clear();
    pins.clear();
    orbits.clear();
    list.forEach((ref) => {
      if (ref.kind === "orbita") {
        const mesh = makeOrbit(ref);
        orbits.set(ref.i, { ref, mesh });
        orbitGroup.add(mesh);
      } else {
        const mesh = makePin(ref, ref.i === selected);
        pins.set(ref.i, { ref, mesh });
        pinGroup.add(mesh);
      }
    });
    highlight(selected);
  }

  function highlight(i) {
    selected = i;
    pins.forEach((entry, key) => {
      const vis = entry.mesh.userData.vis || entry.mesh;
      vis.scale.setScalar(key === i ? 1.55 : 1);
      vis.material.color.setHex(pinColor(entry.ref, key === i));
    });
    orbits.forEach((entry, key) => {
      const tube = entry.mesh.userData.tube;
      const on = key === i;
      tube.material.color.setHex(on ? 0xf0f1ea : 0xde7a93);
      tube.material.opacity = on ? 0.95 : 0.38;
    });
  }

  function flyTo(ref) {
    if (!ref) return;
    highlight(ref.i);
    if (ref.kind === "orbita") {
      const { apoR } = visualRadii(ref);
      const nrm = orbitNormal(ref);
      if (nrm.lengthSq() < 0.01) nrm.set(0, 1, 0);
      const dest = nrm.multiplyScalar(Math.max(apoR * 2.35, CAM_DIST * 0.9));
      fly = {
        from: camera.position.clone(),
        to: dest,
        t: 0,
      };
      controls.target.set(0, 0, 0);
      return;
    }
    const look = latLonToVec3(ref.lat, ref.lon, RADIUS);
    const dest = look.clone().normalize().multiplyScalar(CAM_DIST * 0.72);
    fly = {
      from: camera.position.clone(),
      to: dest,
      t: 0,
      look,
    };
    controls.target.copy(look.clone().multiplyScalar(0.18));
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    if (fly) {
      fly.t = Math.min(1, fly.t + 0.035);
      const e = 1 - Math.pow(1 - fly.t, 3);
      camera.position.lerpVectors(fly.from, fly.to, e);
      if (fly.t >= 1) fly = null;
    }
    controls.update();
    renderer.render(scene, camera);
  }

  renderer.domElement.addEventListener("pointermove", (e) => {
    const ref = hitRef(e);
    if (ref) showTip(ref, e.clientX, e.clientY);
    else hideTip();
  });
  renderer.domElement.addEventListener("pointerleave", hideTip);
  renderer.domElement.addEventListener("pointerdown", (e) => {
    const ref = hitRef(e);
    if (ref) {
      flyTo(ref);
      canvas.dispatchEvent(new CustomEvent("pehuer-pick", { detail: ref, bubbles: true }));
    }
  });

  const ro = new ResizeObserver(() => sizeToStage());
  ro.observe(canvas.parentElement);

  sizeToStage();
  tick();

  return {
    ready: texPromise,
    setRefs,
    flyTo,
    resize: sizeToStage,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
    },
  };
}
