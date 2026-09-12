import * as THREE from "three";
import { GLTFLoader } from "../vendor/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "../vendor/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "../vendor/addons/environments/RoomEnvironment.js";

const PINK = 0xde7a93;
const AR_LAT = -35.2;
const AR_LON = -64.0;

function earthLatLon(lat, lon, r) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

const draco = new DRACOLoader();
draco.setDecoderPath("vendor/addons/libs/draco/gltf/");

function loadGltf(url) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    loader.load(url, resolve, undefined, reject);
  });
}

function loadTex(loader, url, colorSpace) {
  return new Promise((resolve) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = colorSpace;
        resolve(tex);
      },
      undefined,
      () => resolve(null)
    );
  });
}

function seeded(n) {
  return () => {
    n = (n * 16807 + 0) % 2147483647;
    return (n - 1) / 2147483646;
  };
}

function canvasTex(draw, w, h, colorSpace) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = colorSpace;
  tex.anisotropy = 8;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function heightToNormal(src, strength) {
  const w = src.width;
  const h = src.height;
  const data = src.getContext("2d").getImageData(0, 0, w, h).data;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const g = out.getContext("2d");
  const img = g.createImageData(w, h);
  const at = (x, y) => data[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const len = Math.hypot(-dx, -dy, 1);
      const i = (y * w + x) * 4;
      img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(out);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function solarMaps() {
  const w = 1024;
  const h = 512;
  const albedoC = makeCanvas(w, h);
  const roughC = makeCanvas(w, h);
  const metalC = makeCanvas(w, h);
  const heightC = makeCanvas(w, h);
  const a = albedoC.getContext("2d");
  const r = roughC.getContext("2d");
  const m = metalC.getContext("2d");
  const z = heightC.getContext("2d");

  a.fillStyle = "#1a1812";
  a.fillRect(0, 0, w, h);
  r.fillStyle = "#9a9a9a";
  r.fillRect(0, 0, w, h);
  m.fillStyle = "#c8c8c8";
  m.fillRect(0, 0, w, h);
  z.fillStyle = "#4a4a4a";
  z.fillRect(0, 0, w, h);

  const cols = 8;
  const rows = 4;
  const pad = 22;
  const gap = 14;
  const cw = (w - pad * 2 - gap * (cols - 1)) / cols;
  const ch = (h - pad * 2 - gap * (rows - 1)) / rows;

  for (let iy = 0; iy < rows; iy++) {
    for (let ix = 0; ix < cols; ix++) {
      const x = pad + ix * (cw + gap);
      const y = pad + iy * (ch + gap);
      const cell = a.createLinearGradient(x, y, x + cw, y + ch);
      cell.addColorStop(0, "#16324c");
      cell.addColorStop(0.4, "#071018");
      cell.addColorStop(1, "#0b1c2e");
      a.fillStyle = cell;
      a.fillRect(x, y, cw, ch);
      a.strokeStyle = "rgba(196,164,86,0.7)";
      a.lineWidth = 3;
      a.strokeRect(x + 2, y + 2, cw - 4, ch - 4);
      a.fillStyle = "#b89648";
      a.fillRect(x + 6, y + 6, cw - 12, 6);
      a.strokeStyle = "rgba(196,164,86,0.35)";
      a.lineWidth = 1.4;
      const fingers = 11;
      for (let f = 1; f < fingers; f++) {
        const fx = x + 8 + ((cw - 16) * f) / fingers;
        a.beginPath();
        a.moveTo(fx, y + 16);
        a.lineTo(fx, y + ch - 8);
        a.stroke();
      }
      r.fillStyle = "#1c1c1c";
      r.fillRect(x + 4, y + 4, cw - 8, ch - 8);
      r.fillStyle = "#6e6e6e";
      r.fillRect(x + 6, y + 6, cw - 12, 10);
      m.fillStyle = "#3a3a3a";
      m.fillRect(x + 4, y + 4, cw - 8, ch - 8);
      m.fillStyle = "#e6e6e6";
      m.fillRect(x + 6, y + 6, cw - 12, 10);
      z.fillStyle = "#1a1a1a";
      z.fillRect(x + 5, y + 5, cw - 10, ch - 10);
      z.fillStyle = "#b0b0b0";
      z.fillRect(x, y, cw, 4);
      z.fillRect(x, y + ch - 4, cw, 4);
    }
  }

  const map = new THREE.CanvasTexture(albedoC);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  const roughnessMap = new THREE.CanvasTexture(roughC);
  roughnessMap.colorSpace = THREE.NoColorSpace;
  roughnessMap.anisotropy = 8;
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  const metalnessMap = new THREE.CanvasTexture(metalC);
  metalnessMap.colorSpace = THREE.NoColorSpace;
  metalnessMap.anisotropy = 8;
  metalnessMap.wrapS = metalnessMap.wrapT = THREE.RepeatWrapping;
  return {
    map,
    roughnessMap,
    metalnessMap,
    normalMap: heightToNormal(heightC, 3.4),
  };
}

function solarTex() {
  return solarMaps().map;
}

function aluMaps() {
  const rnd = seeded(44100);
  const albedo = canvasTex(
    (g, w, h) => {
      const base = g.createLinearGradient(0, 0, w, 0);
      base.addColorStop(0, "#8d9198");
      base.addColorStop(0.5, "#d5d8de");
      base.addColorStop(1, "#9aa0a8");
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 240; i++) {
        const y = rnd() * h;
        g.strokeStyle = `rgba(255,255,255,${0.04 + rnd() * 0.1})`;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(w, y + (rnd() - 0.5) * 3);
        g.stroke();
      }
      for (let i = 0; i < 40; i++) {
        g.fillStyle = `rgba(20,22,26,${0.08 + rnd() * 0.12})`;
        g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 18, 1);
      }
    },
    1024,
    256,
    THREE.SRGBColorSpace
  );
  albedo.repeat.set(1, 4);
  return albedo;
}

function foilTex() {
  const rnd = seeded(90210);
  return canvasTex(
    (g, w, h) => {
      const base = g.createLinearGradient(0, 0, w, h);
      base.addColorStop(0, "#f4e6c0");
      base.addColorStop(0.28, "#c9ae74");
      base.addColorStop(0.62, "#8f7040");
      base.addColorStop(1, "#e2c888");
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 140; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        const ww = 30 + rnd() * 200;
        const hh = 6 + rnd() * 26;
        g.fillStyle = `rgba(${190 + rnd() * 50 | 0},${150 + rnd() * 50 | 0},${70 + rnd() * 50 | 0},${0.1 + rnd() * 0.22})`;
        g.beginPath();
        g.ellipse(x, y, ww, hh, rnd() * Math.PI, 0, Math.PI * 2);
        g.fill();
      }
      g.strokeStyle = "rgba(50,36,14,0.2)";
      g.lineWidth = 1;
      for (let y = 0; y < h; y += 22) {
        g.beginPath();
        g.moveTo(0, y + rnd() * 6);
        for (let x = 0; x <= w; x += 40) g.lineTo(x, y + rnd() * 8 - 4);
        g.stroke();
      }
    },
    1024,
    1024,
    THREE.SRGBColorSpace
  );
}

function prepareModel(scene, target, sitOnGround) {
  const wrap = new THREE.Group();
  wrap.add(scene);
  const box = new THREE.Box3().setFromObject(wrap);
  const size = new THREE.Vector3();
  box.getSize(size);
  const s = target / Math.max(size.x, size.y, size.z, 0.001);
  scene.scale.multiplyScalar(s);
  box.setFromObject(wrap);
  const c = new THREE.Vector3();
  box.getCenter(c);
  scene.position.sub(c);
  if (sitOnGround) {
    box.setFromObject(wrap);
    scene.position.y -= box.min.y;
  }
  wrap.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (!m) return;
      m.envMapIntensity = 0.22;
      if (m.color) m.color.multiplyScalar(0.78);
      if (m.roughness != null) m.roughness = Math.min(1, (m.roughness ?? 0.45) + 0.1);
      m.needsUpdate = true;
    });
  });
  return wrap;
}

function splitRollingWheels(src) {
  const srcGeo = src.geometry.index ? src.geometry.toNonIndexed() : src.geometry.clone();
  srcGeo.computeBoundingBox();
  const bb = srcGeo.boundingBox;
  const size = new THREE.Vector3();
  bb.getSize(size);
  const midZ = (bb.min.z + bb.max.z) * 0.5;
  const cutA = bb.min.x + size.x * 0.33;
  const cutB = bb.min.x + size.x * 0.66;
  const pos = srcGeo.attributes.position;
  const bins = [[], [], [], [], [], []];
  for (let i = 0; i < pos.count; i += 3) {
    const mx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
    const mz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
    const xi = mx < cutA ? 0 : mx < cutB ? 1 : 2;
    const zi = mz < midZ ? 0 : 1;
    bins[zi * 3 + xi].push(i);
  }
  const wheels = [];
  bins.forEach((tris) => {
    if (tris.length < 24) return;
    const geo = new THREE.BufferGeometry();
    const n = tris.length * 3;
    const arr = new Float32Array(n * 3);
    const nrmSrc = srcGeo.attributes.normal;
    const nrm = nrmSrc ? new Float32Array(n * 3) : null;
    const uvSrc = srcGeo.attributes.uv;
    const uvs = uvSrc ? new Float32Array(n * 2) : null;
    let w = 0;
    tris.forEach((i) => {
      for (let k = 0; k < 3; k++) {
        arr[w * 3] = pos.getX(i + k);
        arr[w * 3 + 1] = pos.getY(i + k);
        arr[w * 3 + 2] = pos.getZ(i + k);
        if (nrm) {
          nrm[w * 3] = nrmSrc.getX(i + k);
          nrm[w * 3 + 1] = nrmSrc.getY(i + k);
          nrm[w * 3 + 2] = nrmSrc.getZ(i + k);
        }
        if (uvs) {
          uvs[w * 2] = uvSrc.getX(i + k);
          uvs[w * 2 + 1] = uvSrc.getY(i + k);
        }
        w += 1;
      }
    });
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    if (nrm) geo.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
    else geo.computeVertexNormals();
    if (uvs) geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.computeBoundingBox();
    const center = new THREE.Vector3();
    geo.boundingBox.getCenter(center);
    geo.translate(-center.x, -center.y, -center.z);
    const mesh = new THREE.Mesh(geo, src.material);
    mesh.position.copy(center);
    mesh.castShadow = true;
    mesh.userData.spin = true;
    src.parent.add(mesh);
    wheels.push(mesh);
  });
  src.visible = false;
  return wheels;
}

function prepareRover(scene, target) {
  const wrap = prepareModel(scene, target, true);
  wrap.traverse((o) => {
    if (o.isSkinnedMesh) o.visible = false;
    if (/empty|name_chips|calibration_target|^box$|^probe/i.test(o.name)) o.visible = false;
  });
  let wheelSrc = null;
  wrap.traverse((o) => {
    if (o.isMesh && /wheels_objs/i.test(o.name)) wheelSrc = o;
  });
  wrap.userData.wheels = wheelSrc ? splitRollingWheels(wheelSrc) : [];
  bindRover(wrap);
  return wrap;
}

function bindRover(wrap) {
  const wheels = [];
  let tip = null;
  wrap.traverse((o) => {
    if (o.userData?.spin) wheels.push(o);
    if (o.isMesh && /antenna_hg/i.test(o.name)) tip = o;
  });
  wrap.userData.wheels = wheels.length ? wheels : wrap.userData.wheels || [];
  if (!tip) {
    wrap.traverse((o) => {
      if (o.userData?.tipAnchor) tip = o;
    });
  }
  if (!tip) {
    tip = new THREE.Object3D();
    tip.userData.tipAnchor = true;
    const box = new THREE.Box3().setFromObject(wrap);
    tip.position.set(0, box.max.y * 0.82, 0);
    wrap.add(tip);
  }
  wrap.userData.tip = tip;
}

function makeSatellite() {
  const g = new THREE.Group();
  const foil = foilTex();
  foil.repeat.set(1.2, 1.8);
  const solar = solarMaps();
  const aluMap = aluMaps();
  const mli = new THREE.MeshPhysicalMaterial({
    map: foil,
    color: 0xd8be82,
    roughness: 0.3,
    metalness: 0.9,
    envMapIntensity: 1.25,
  });
  const alu = new THREE.MeshPhysicalMaterial({
    map: aluMap,
    color: 0xc4c8d0,
    roughness: 0.24,
    metalness: 0.98,
    envMapIntensity: 1.45,
  });
  const black = new THREE.MeshPhysicalMaterial({
    color: 0x14161a,
    roughness: 0.34,
    metalness: 0.7,
    envMapIntensity: 0.8,
  });
  const cells = new THREE.MeshPhysicalMaterial({
    map: solar.map,
    roughnessMap: solar.roughnessMap,
    metalnessMap: solar.metalnessMap,
    normalMap: solar.normalMap,
    color: 0xffffff,
    roughness: 0.26,
    metalness: 0.2,
    clearcoat: 0.88,
    clearcoatRoughness: 0.1,
    envMapIntensity: 0.9,
  });
  const gold = new THREE.MeshPhysicalMaterial({
    color: 0xc4a45a,
    roughness: 0.24,
    metalness: 0.95,
    envMapIntensity: 1.4,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x0b1622,
    roughness: 0.05,
    metalness: 0.12,
    envMapIntensity: 1.8,
    transparent: true,
    opacity: 0.7,
  });

  const U = 0.1;
  const W = U;
  const D = U;
  const H = U * 3.4;
  const rail = 0.012;

  const core = new THREE.Mesh(new THREE.BoxGeometry(W - 0.018, H - 0.01, D - 0.018), black);
  core.castShadow = true;
  g.add(core);

  [-1, 1].forEach((sz) => {
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(W - 0.03, H - 0.028, 0.003), mli);
    blanket.position.z = sz * (D / 2 - 0.011);
    g.add(blanket);
  });

  for (let u = -1; u <= 1; u++) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(W - 0.02, 0.0018, D - 0.02), black);
    seam.position.y = u * (H / 3);
    g.add(seam);
  }

  [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ].forEach(([sx, sz]) => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(rail, H + 0.006, rail), alu);
    r.position.set(sx * (W / 2 - rail / 2), 0, sz * (D / 2 - rail / 2));
    r.castShadow = true;
    g.add(r);
    for (let i = -3; i <= 3; i++) {
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.004, 8), black);
      hole.rotation.z = Math.PI / 2;
      hole.position.set(sx * (W / 2 + 0.001), i * (H / 8), sz * (D / 2 - rail / 2));
      g.add(hole);
    }
  });

  const top = new THREE.Mesh(new THREE.BoxGeometry(W, 0.008, D), alu);
  top.position.y = H / 2;
  const bot = top.clone();
  bot.position.y = -H / 2;
  g.add(top, bot);

  function bodyPanel(w, h, x, y, z, ry) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.0035), cells);
    plate.position.set(x, y, z);
    plate.rotation.y = ry;
    plate.castShadow = true;
    g.add(plate);
  }
  for (let i = -1; i <= 1; i++) {
    bodyPanel(D - 0.034, U * 0.86, W / 2 + 0.001, i * (H / 3), 0, Math.PI / 2);
    bodyPanel(D - 0.034, U * 0.86, -W / 2 - 0.001, i * (H / 3), 0, -Math.PI / 2);
  }

  function smallWing(sign) {
    const wing = new THREE.Group();
    const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.016, 0.018), black);
    hinge.position.x = sign * (W / 2 + 0.006);
    wing.add(hinge);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.0024, 0.0024, 0.02, 10), alu);
    pin.rotation.z = Math.PI / 2;
    pin.position.x = sign * (W / 2 + 0.01);
    wing.add(pin);
    const pw = U * 0.92;
    const ph = U * 1.85;
    const cell = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, 0.003), cells);
    cell.castShadow = true;
    const back = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, 0.002), black);
    back.position.z = -0.0025;
    const t = 0.004;
    const topF = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.006, t, 0.005), gold);
    topF.position.y = ph / 2;
    const botF = topF.clone();
    botF.position.y = -ph / 2;
    const sideA = new THREE.Mesh(new THREE.BoxGeometry(t, ph + 0.006, 0.005), gold);
    sideA.position.x = -pw / 2;
    const sideB = sideA.clone();
    sideB.position.x = pw / 2;
    const panel = new THREE.Group();
    panel.add(cell, back, topF, botF, sideA, sideB);
    panel.position.x = sign * (W / 2 + 0.01 + pw / 2);
    panel.rotation.y = sign * 0.42;
    wing.add(panel);
    g.add(wing);
  }
  smallWing(-1);
  smallWing(1);

  const tracker = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.011, 0.018, 16), black);
  tracker.position.set(0.018, H / 2 + 0.012, 0.012);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.007, 12, 10), glass);
  lens.scale.y = 0.4;
  lens.position.set(0.018, H / 2 + 0.022, 0.012);
  g.add(tracker, lens);

  const patch = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.028, 0.003), gold);
  patch.position.set(-0.016, H / 2 + 0.005, -0.012);
  patch.rotation.x = -Math.PI / 2;
  g.add(patch);

  const whip = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, 0.07, 8), alu);
  whip.position.set(0.02, H / 2 + 0.04, -0.03);
  whip.rotation.z = 0.18;
  g.add(whip);

  const node = new THREE.Object3D();
  node.position.set(0, H / 2 + 0.02, 0);
  g.add(node);
  g.userData.node = node;
  g.rotation.set(0.52, 0.98, -0.22);
  g.scale.setScalar(1.82);
  return g;
}

function addWings(wrap) {
  const box = new THREE.Box3().setFromObject(wrap);
  const size = new THREE.Vector3();
  box.getSize(size);
  const mat = new THREE.MeshPhysicalMaterial({
    map: solarTex(),
    color: 0xffffff,
    roughness: 0.22,
    metalness: 0.55,
    clearcoat: 0.45,
    clearcoatRoughness: 0.2,
  });
  const geo = new THREE.BoxGeometry(size.x * 2.6, Math.max(0.03, size.y * 0.06), size.z * 0.92);
  const left = new THREE.Mesh(geo, mat);
  left.position.set(-size.x * 1.85, size.y * 0.15, 0);
  left.castShadow = true;
  const right = left.clone();
  right.position.x *= -1;
  wrap.add(left, right);
}

function makeLink() {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(9), 3));
  geo.setAttribute("lineDistance", new THREE.BufferAttribute(new Float32Array(3), 1));
  const line = new THREE.Line(
    geo,
    new THREE.LineDashedMaterial({
      color: PINK,
      dashSize: 0.16,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.88,
    })
  );
  line.frustumCulled = false;
  const DOTS = 42;
  const dotPos = new Float32Array(DOTS * 3);
  const dots = new THREE.Points(
    new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(dotPos, 3)),
    new THREE.PointsMaterial({
      color: PINK,
      size: 0.028,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    })
  );
  dots.frustumCulled = false;
  dots.userData.pos = dotPos;
  dots.userData.n = DOTS;
  return { line, dots };
}

function writeLink(pack, a, mid, b, phase, tmp) {
  const pos = pack.line.geometry.attributes.position;
  pos.setXYZ(0, a.x, a.y, a.z);
  pos.setXYZ(1, mid.x, mid.y, mid.z);
  pos.setXYZ(2, b.x, b.y, b.z);
  pos.needsUpdate = true;
  const d1 = a.distanceTo(mid);
  const d2 = mid.distanceTo(b);
  const dist = pack.line.geometry.attributes.lineDistance;
  dist.setX(0, phase);
  dist.setX(1, phase + d1);
  dist.setX(2, phase + d1 + d2);
  dist.needsUpdate = true;
  const total = Math.max(0.001, d1 + d2);
  const step = total / pack.dots.userData.n;
  const arr = pack.dots.userData.pos;
  for (let i = 0; i < pack.dots.userData.n; i++) {
    const d = (i * step + (phase % step) + total) % total;
    if (d < d1) tmp.copy(a).lerp(mid, d / d1);
    else tmp.copy(mid).lerp(b, (d - d1) / d2);
    arr[i * 3] = tmp.x;
    arr[i * 3 + 1] = tmp.y;
    arr[i * 3 + 2] = tmp.z;
  }
  pack.dots.geometry.attributes.position.needsUpdate = true;
}

export function createNetworkCine(canvas) {
  const reduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.setClearColor(0x000000, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 20, 42);
  requestAnimationFrame(() => {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.38;
    pmrem.dispose();
  });

  const camera = new THREE.PerspectiveCamera(30, 1, 0.08, 90);
  camera.position.set(0.05, 1.22, 6.15);

  const hemi = new THREE.HemisphereLight(0xf3efe6, 0x0b0c10, 0.22);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xf0e6d2, 2.15);
  sun.position.set(8.2, 7.4, 5.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = -10;
  sun.shadow.camera.right = 10;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -6;
  sun.shadow.bias = -0.00025;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x8ea0b8, 0.35);
  rim.position.set(-7, 2.4, -3);
  scene.add(rim);
  const key = new THREE.DirectionalLight(0xfff6ea, 0.85);
  key.position.set(-2.4, 3.2, 6.8);
  scene.add(key);
  const satFill = new THREE.DirectionalLight(0xfff1dc, 0.85);
  satFill.position.set(1.6, 3.6, 4.2);
  scene.add(satFill);
  const satKey = new THREE.PointLight(0xfff3e4, 1.35, 2.6, 1.9);
  satKey.position.set(0.2, 2.45, 0.35);
  scene.add(satKey);
  const satRim = new THREE.PointLight(0x9eb6d4, 1.1, 2.8, 1.8);
  satRim.position.set(1.05, 2.55, -1.15);
  scene.add(satRim);
  const earthFill = new THREE.DirectionalLight(0xe8eef6, 0.55);
  earthFill.position.set(6.4, 3.6, 1.2);
  scene.add(earthFill);

  const loader = new THREE.TextureLoader();
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(48, 32),
    new THREE.MeshStandardMaterial({
      color: 0x7a7874,
      roughness: 1,
      metalness: 0,
      envMapIntensity: 0.08,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const earthR = 1.26;
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(earthR, 96, 64),
    new THREE.MeshPhongMaterial({
      color: 0xc5c9ce,
      shininess: 16,
      specular: 0x2a3544,
    })
  );
  earth.position.set(4.62, 2.02, -5.7);
  scene.add(earth);
  earthFill.target.position.copy(earth.position);
  scene.add(earthFill.target);
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(earthR * 1.008, 64, 40),
    new THREE.MeshLambertMaterial({
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      color: 0xffffff,
    })
  );
  earth.add(clouds);
  const arLocal = earthLatLon(AR_LAT, AR_LON, earthR + 0.03);
  const arNode = new THREE.Object3D();
  earth.add(arNode);
  arNode.position.copy(arLocal);

  const lookCam = new THREE.Vector3();
  function faceArgentina() {
    camera.getWorldPosition(lookCam);
    const toCam = lookCam.sub(earth.position).normalize();
    earth.quaternion.setFromUnitVectors(arLocal.clone().normalize(), toCam);
    earth.rotateY(-0.38);
  }

  const linkA = makeLink();
  const linkB = makeLink();
  scene.add(linkA.line, linkA.dots, linkB.line, linkB.dots);

  let roverA = new THREE.Group();
  let roverB = new THREE.Group();
  const sat = makeSatellite();
  sat.position.set(0.48, 2.02, -0.42);
  scene.add(roverA, roverB, sat);

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const s = new THREE.Vector3();
  const e = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let phase = 0;
  let t = 0;
  let last = 0;
  let paused = true;
  let raf = 0;
  let ready = false;
  let reveal = () => {};
  const readyPromise = new Promise((resolve) => {
    reveal = resolve;
  });

  const aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  function markReady() {
    if (ready) return;
    ready = true;
    canvas.parentElement?.classList.add("is-ready");
    reveal();
  }
  markReady();

  loadTex(loader, "assets/moon-hi.jpg", THREE.SRGBColorSpace).then((moonMap) => {
    if (!moonMap) return;
    moonMap.anisotropy = aniso;
    moonMap.wrapS = moonMap.wrapT = THREE.RepeatWrapping;
    moonMap.repeat.set(1.6, 1);
    moonMap.offset.set(0.22, 0.18);
    ground.material.map = moonMap;
    ground.material.color.set(0x8a8478);
    ground.material.needsUpdate = true;
  });
  loadTex(loader, "assets/earth.jpg", THREE.SRGBColorSpace).then((earthMap) => {
    if (!earthMap) return;
    earthMap.anisotropy = aniso;
    earthMap.generateMipmaps = true;
    earthMap.minFilter = THREE.LinearMipmapLinearFilter;
    earthMap.magFilter = THREE.LinearFilter;
    earth.material.map = earthMap;
    earth.material.color.set(0xd0d4d8);
    earth.material.needsUpdate = true;
  });
  loadTex(loader, "assets/earth-spec.jpg", THREE.NoColorSpace).then((earthSpec) => {
    if (!earthSpec) return;
    earthSpec.anisotropy = aniso;
    earth.material.specularMap = earthSpec;
    earth.material.needsUpdate = true;
  });
  loadTex(loader, "assets/earth-clouds.png", THREE.SRGBColorSpace).then((cloudMap) => {
    if (!cloudMap) return;
    cloudMap.anisotropy = aniso;
    clouds.material.map = cloudMap;
    clouds.material.needsUpdate = true;
  });
  loadGltf("assets/rover.glb").then((roverGltf) => {
    if (!roverGltf) return;
    scene.remove(roverA, roverB);
    roverA = prepareRover(roverGltf.scene, 1.02);
    roverB = roverA.clone(true);
    roverB.scale.multiplyScalar(0.52 / 1.02);
    bindRover(roverB);
    scene.add(roverA, roverB);
  }).catch(() => {});

  let viewW = 0;
  let viewH = 0;
  function sizeToStage() {
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w < 8 || h < 8) return;
    if (w === viewW && h === viewH) return;
    viewW = w;
    viewH = h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function setPaused(next) {
    paused = !!next;
    if (!paused && !raf) tick(performance.now());
  }

  function driveRover(rover, x, z, vx, dt) {
    rover.position.set(x, 0, z);
    rover.rotation.y = Math.PI / 2;
    const spin = (vx * dt) / 0.15;
    (rover.userData.wheels || []).forEach((w) => {
      w.rotateZ(-spin);
    });
  }

  function tick(now) {
    if (paused) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(tick);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    if (!reduced) t += dt;

    const x1 = -1.15 + Math.sin(t * 0.16) * 0.26;
    const v1 = Math.cos(t * 0.16) * 0.26 * 0.16;
    driveRover(roverA, x1, 0.92, v1, dt);

    const x2 = 1.28 + Math.sin(t * 0.12 + 2.2) * 0.16;
    const v2 = Math.cos(t * 0.12 + 2.2) * 0.16 * 0.12;
    driveRover(roverB, x2, -1.85, v2, dt);

    sat.rotation.y = 0.98 + Math.sin(t * 0.08) * 0.02;
    sat.position.set(0.48, 2.02 + Math.sin(t * 0.16) * 0.02, -0.42);
    clouds.rotation.y = t * 0.01;

    camera.position.x = 0.05 + Math.sin(t * 0.04) * 0.04;
    camera.position.y = 1.22 + Math.sin(t * 0.05) * 0.015;
    camera.lookAt(0.12, 0.82, 0.2);

    if (!ready) return;
    faceArgentina();
    if (sat.userData.node) {
      roverA.userData.tip?.getWorldPosition(a);
      roverB.userData.tip?.getWorldPosition(b);
      sat.userData.node.getWorldPosition(s);
      arNode.getWorldPosition(e);
      if (!reduced) phase = (phase - dt * 0.5) % 12;
      if (roverA.userData.tip) writeLink(linkA, a, s, e, phase, tmp);
      if (roverB.userData.tip) writeLink(linkB, b, s, e, phase + 0.4, tmp);
    }
    renderer.render(scene, camera);
  }

  const ro = new ResizeObserver(() => sizeToStage());
  ro.observe(canvas.parentElement);
  sizeToStage();
  faceArgentina();

  return {
    ready: readyPromise,
    setPaused,
    resize: sizeToStage,
    dispose() {
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      renderer.dispose();
    },
  };
}
