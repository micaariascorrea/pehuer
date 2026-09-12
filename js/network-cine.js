import * as THREE from "three";
import { GLTFLoader } from "../vendor/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "../vendor/addons/loaders/DRACOLoader.js";

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

function solarTex() {
  return canvasTex(
    (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, w, h);
      grd.addColorStop(0, "#16385c");
      grd.addColorStop(0.45, "#2a5c8c");
      grd.addColorStop(1, "#1a446c");
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(214,186,118,0.85)";
      g.lineWidth = 2.2;
      for (let x = 0; x <= w; x += 48) {
        g.beginPath();
        g.moveTo(x + 0.5, 0);
        g.lineTo(x + 0.5, h);
        g.stroke();
      }
      for (let y = 0; y <= h; y += 32) {
        g.beginPath();
        g.moveTo(0, y + 0.5);
        g.lineTo(w, y + 0.5);
        g.stroke();
      }
      g.strokeStyle = "rgba(210,190,130,0.22)";
      g.lineWidth = 0.6;
      for (let x = 0; x <= w; x += 8) {
        g.beginPath();
        g.moveTo(x + 0.5, 0);
        g.lineTo(x + 0.5, h);
        g.stroke();
      }
    },
    1024,
    512,
    THREE.SRGBColorSpace
  );
}

function foilTex() {
  const rnd = seeded(90210);
  return canvasTex(
    (g, w, h) => {
      const base = g.createLinearGradient(0, 0, w, h);
      base.addColorStop(0, "#f0e2b8");
      base.addColorStop(0.35, "#c9ae74");
      base.addColorStop(0.7, "#a8884c");
      base.addColorStop(1, "#d8c08a");
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 90; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        const ww = 40 + rnd() * 180;
        const hh = 8 + rnd() * 28;
        g.fillStyle = `rgba(${200 + rnd() * 40 | 0},${170 + rnd() * 40 | 0},${90 + rnd() * 40 | 0},${0.08 + rnd() * 0.18})`;
        g.beginPath();
        g.ellipse(x, y, ww, hh, rnd() * Math.PI, 0, Math.PI * 2);
        g.fill();
      }
      g.strokeStyle = "rgba(70,52,24,0.18)";
      g.lineWidth = 1;
      for (let y = 0; y < h; y += 28) {
        g.beginPath();
        g.moveTo(0, y + rnd() * 6);
        for (let x = 0; x <= w; x += 48) g.lineTo(x, y + rnd() * 8 - 4);
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
      m.envMapIntensity = 1.15;
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
  let tip = null;
  wrap.traverse((o) => {
    if (o.isMesh && /antenna_hg/i.test(o.name)) tip = o;
  });
  if (!tip) {
    tip = new THREE.Object3D();
    const box = new THREE.Box3().setFromObject(wrap);
    tip.position.set(0, box.max.y * 0.82, 0);
    wrap.add(tip);
  }
  wrap.userData.tip = tip;
  return wrap;
}

function dishGeo(r) {
  const pts = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    pts.push(new THREE.Vector2(r * t, 0.38 * r * t * t));
  }
  return new THREE.LatheGeometry(pts, 56);
}

function makeSatellite() {
  const g = new THREE.Group();
  const foil = foilTex();
  foil.repeat.set(2, 2);
  const gold = new THREE.MeshPhysicalMaterial({
    map: foil,
    color: 0xc9ae72,
    roughness: 0.32,
    metalness: 0.86,
    envMapIntensity: 1.4,
    clearcoat: 0.18,
    clearcoatRoughness: 0.45,
  });
  const frame = new THREE.MeshPhysicalMaterial({
    color: 0xc4b089,
    roughness: 0.28,
    metalness: 0.78,
  });
  const dark = new THREE.MeshPhysicalMaterial({
    color: 0x14161a,
    roughness: 0.36,
    metalness: 0.62,
  });
  const dishMat = new THREE.MeshPhysicalMaterial({
    color: 0xd8d2c6,
    roughness: 0.18,
    metalness: 0.55,
    clearcoat: 0.45,
    clearcoatRoughness: 0.16,
  });
  const cells = new THREE.MeshPhysicalMaterial({
    map: solarTex(),
    color: 0xffffff,
    roughness: 0.12,
    metalness: 0.55,
    clearcoat: 0.72,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.2,
  });

  const bus = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.168, 0.2), gold);
  bus.castShadow = true;
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.208, 0.03, 0.208), dark);
  band.position.y = -0.01;

  const dish = new THREE.Mesh(dishGeo(0.11), dishMat);
  dish.rotation.set(-0.85, 0.55, 0.15);
  dish.position.set(0.02, 0.145, 0.07);
  dish.castShadow = true;
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.09, 12), dark);
  boom.rotation.set(0.7, 0, 0.25);
  boom.position.set(0.01, 0.11, 0.04);
  const feed = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.01, 0.028, 10), dark);
  feed.rotation.copy(dish.rotation);
  feed.position.set(0.035, 0.125, 0.095);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.108, 0.004, 8, 40), frame);
  rim.rotation.copy(dish.rotation);
  rim.position.copy(dish.position);

  function wing(sign) {
    const w = new THREE.Group();
    for (let i = 0; i < 2; i++) {
      const fr = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.168, 0.01), frame);
      const cell = new THREE.Mesh(new THREE.BoxGeometry(0.276, 0.148, 0.005), cells);
      cell.position.z = 0.005;
      const seg = new THREE.Group();
      seg.add(fr, cell);
      seg.position.x = sign * (0.265 + i * 0.31);
      seg.rotation.y = sign * -0.2;
      seg.rotation.x = 0.06;
      w.add(seg);
    }
    const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.036), dark);
    yoke.position.x = sign * 0.118;
    w.add(yoke);
    return w;
  }

  const helix = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.07, 10), dark);
  helix.position.set(0.07, 0.12, -0.02);
  const thr = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.008, 0.02, 10), dark);
  thr.rotation.x = Math.PI / 2;
  thr.position.set(0, -0.09, -0.08);

  const node = new THREE.Object3D();
  node.position.set(0, 0.05, 0.04);
  g.add(bus, band, dish, boom, feed, rim, wing(-1), wing(1), helix, thr, node);
  g.userData.node = node;
  g.rotation.set(0.16, 0.34, -0.05);
  g.scale.setScalar(1.7);
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 12, 30);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.08, 90);
  camera.position.set(0.05, 1.22, 6.15);

  const hemi = new THREE.HemisphereLight(0xf3efe6, 0x0b0c10, 0.22);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1dc, 3.1);
  sun.position.set(8.2, 7.4, 5.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
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
  const satFill = new THREE.DirectionalLight(0xfff1dc, 1.35);
  satFill.position.set(1.6, 3.6, 4.2);
  scene.add(satFill);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(new THREE.HemisphereLight(0xffffff, 0x101014, 1.1));
  const envSun = new THREE.DirectionalLight(0xfff3e4, 2.2);
  envSun.position.set(4, 8, 3);
  envScene.add(envSun);
  scene.environment = pmrem.fromScene(envScene, 0.06).texture;
  pmrem.dispose();

  const loader = new THREE.TextureLoader();
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 54),
    new THREE.MeshStandardMaterial({ color: 0x7a7874, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.visible = false;
  scene.add(ground);

  const earthR = 1.26;
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(earthR, 96, 64),
    new THREE.MeshPhongMaterial({ color: 0xb0b6bc, shininess: 10 })
  );
  earth.position.set(4.62, 2.02, -5.7);
  earth.visible = false;
  scene.add(earth);
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(earthR * 1.008, 64, 48),
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
  sat.position.set(0.82, 2.08, -0.45);
  sat.visible = false;
  scene.add(roverA, roverB, sat);
  linkA.line.visible = linkA.dots.visible = false;
  linkB.line.visible = linkB.dots.visible = false;

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const s = new THREE.Vector3();
  const e = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let phase = 0;
  let t = 0;
  let last = 0;
  let paused = false;
  let raf = 0;
  let ready = false;
  let reveal = () => {};
  const readyPromise = new Promise((resolve) => {
    reveal = resolve;
  });

  Promise.all([
    loadTex(loader, "assets/moon-hi.jpg", THREE.SRGBColorSpace),
    loadTex(loader, "assets/earth.jpg", THREE.SRGBColorSpace),
    loadTex(loader, "assets/earth-spec.jpg", THREE.NoColorSpace),
    loadTex(loader, "assets/earth-clouds.png", THREE.SRGBColorSpace),
    loadGltf("assets/rover.glb").catch(() => null),
  ]).then(([moonMap, earthMap, specMap, cloudMap, roverGltf]) => {
    const aniso = renderer.capabilities.getMaxAnisotropy();
    if (moonMap) {
      moonMap.anisotropy = aniso;
      moonMap.wrapS = moonMap.wrapT = THREE.RepeatWrapping;
      moonMap.repeat.set(1.6, 1);
      moonMap.offset.set(0.22, 0.18);
      ground.material.map = moonMap;
      ground.material.color.set(0xffffff);
      ground.material.needsUpdate = true;
    }
    if (earthMap) {
      earthMap.anisotropy = 1;
      earthMap.generateMipmaps = true;
      earthMap.minFilter = THREE.LinearMipmapLinearFilter;
      earthMap.magFilter = THREE.LinearFilter;
      earth.material.map = earthMap;
      earth.material.color.set(0xa8aeb4);
    }
    if (specMap) {
      specMap.anisotropy = aniso;
      earth.material.specularMap = specMap;
      earth.material.specular = new THREE.Color(0x2a2a2a);
    }
    earth.material.needsUpdate = true;
    if (cloudMap) {
      cloudMap.anisotropy = aniso;
      clouds.material.map = cloudMap;
      clouds.material.needsUpdate = true;
    }
    if (roverGltf) {
      scene.remove(roverA, roverB);
      roverA = prepareRover(roverGltf.scene.clone(true), 1.02);
      roverB = prepareRover(roverGltf.scene.clone(true), 0.52);
      scene.add(roverA, roverB);
    }
    ground.visible = true;
    earth.visible = true;
    sat.visible = true;
    linkA.line.visible = linkA.dots.visible = true;
    linkB.line.visible = linkB.dots.visible = true;
    ready = true;
    canvas.parentElement?.classList.add("is-ready");
    reveal();
  }).catch(() => {
    ground.visible = true;
    earth.visible = true;
    sat.visible = true;
    ready = true;
    canvas.parentElement?.classList.add("is-ready");
    reveal();
  });

  function sizeToStage() {
    const parent = canvas.parentElement;
    const w = Math.max(1, parent.clientWidth);
    const h = Math.max(1, parent.clientHeight);
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

    sat.rotation.y = 0.34 + Math.sin(t * 0.08) * 0.025;
    sat.position.set(0.82, 2.08 + Math.sin(t * 0.16) * 0.02, -0.45);
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
  tick(performance.now());

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
