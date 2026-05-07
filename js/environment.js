import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { registerTicker } from './animation.js';

// ── Sky ──────────────────────────────────────────────────────────────────────
function buildSky() {
  const geo = new THREE.SphereGeometry(800, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      horizonColor: { value: new THREE.Color(0xd4e8f5) },
      zenithColor:  { value: new THREE.Color(0x2a7ab8) },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 horizonColor;
      uniform vec3 zenithColor;
      varying vec3 vWorldPos;
      void main() {
        float t = smoothstep(0.0, 0.45, normalize(vWorldPos).y);
        gl_FragColor = vec4(mix(horizonColor, zenithColor, t), 1.0);
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
}

// ── Lens flare ────────────────────────────────────────────────────────────────
function createFlareTex(size, inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0,    `rgba(${inner},1)`);
  g.addColorStop(0.25, `rgba(${inner},0.6)`);
  g.addColorStop(1,    `rgba(${outer},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

function buildLensflare(sunPos) {
  const lf = new Lensflare();
  lf.addElement(new LensflareElement(createFlareTex(256, '255,220,150', '255,180,60'),  256, 0));
  lf.addElement(new LensflareElement(createFlareTex(64,  '200,230,255', '100,180,255'), 64,  0.4));
  lf.addElement(new LensflareElement(createFlareTex(48,  '255,255,255', '200,200,255'), 48,  0.7));
  lf.position.copy(sunPos);
  return lf;
}

// ── Clouds ───────────────────────────────────────────────────────────────────
function buildCloudMesh(rng) {
  const geos = [];
  const count = 4 + Math.floor(rng() * 4);
  for (let i = 0; i < count; i++) {
    const r = 4 + rng() * 4;
    const g = new THREE.SphereGeometry(r, 7, 5);
    g.translate(
      (rng() - 0.5) * 12,
      (rng() - 0.5) * 3,
      (rng() - 0.5) * 8,
    );
    geos.push(g);
  }
  const merged = mergeGeometries(geos);
  return new THREE.Mesh(
    merged,
    new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.82 }),
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export function buildEnvironment(scene) {
  // Sky
  scene.add(buildSky());
  scene.fog = new THREE.FogExp2(0xc8dff0, 0.0012);

  // Sun direction
  const SUN_POS = new THREE.Vector3(60, 80, 40);

  // Directional light (sun)
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
  sun.position.copy(SUN_POS);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left   = -90;
  sun.shadow.camera.right  =  90;
  sun.shadow.camera.top    =  90;
  sun.shadow.camera.bottom = -90;
  sun.shadow.camera.near   = 0.5;
  sun.shadow.camera.far    = 350;
  sun.shadow.bias = -0.001;
  scene.add(sun);

  // Fill lights
  scene.add(new THREE.AmbientLight(0xaac8e8, 0.4));
  scene.add(new THREE.HemisphereLight(0x87ceeb, 0xc8a870, 0.6));

  // Lens flare
  scene.add(buildLensflare(SUN_POS));

  // Clouds
  let seed = 42;
  const rng = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; };
  const clouds = [];
  for (let i = 0; i < 12; i++) {
    const cloud = buildCloudMesh(rng);
    cloud.position.set(
      (rng() - 0.5) * 400,
      120 + rng() * 40,
      (rng() - 0.5) * 400,
    );
    scene.add(cloud);
    clouds.push(cloud);
  }

  // Drift clouds
  registerTicker((delta) => {
    for (const c of clouds) {
      c.position.x += 1.5 * delta;
      if (c.position.x > 250) c.position.x = -250;
    }
  });
}
