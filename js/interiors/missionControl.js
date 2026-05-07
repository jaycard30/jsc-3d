import * as THREE from 'three';
import { registerTicker } from '../animation.js';

let scene = null;
let interactables = [];

// ── Canvas telemetry texture ──────────────────────────────────────────────────
function buildBigScreenTexture() {
  const W = 512, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);

  function redraw() {
    ctx.fillStyle = '#050f08';
    ctx.fillRect(0, 0, W, H);

    // World map outline (simplified grid)
    ctx.strokeStyle = 'rgba(0,200,80,0.35)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath(); ctx.moveTo(i * W / 8, 0); ctx.lineTo(i * W / 8, H); ctx.stroke();
    }
    for (let j = 0; j <= 4; j++) {
      ctx.beginPath(); ctx.moveTo(0, j * H / 4); ctx.lineTo(W, j * H / 4); ctx.stroke();
    }

    // Orbit track
    ctx.beginPath();
    ctx.strokeStyle = '#00ff55';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= W; x++) {
      const y = H / 2 + Math.sin((x / W) * Math.PI * 3 + Date.now() * 0.0015) * 60;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Moving dot on orbit
    const dotX = ((Date.now() * 0.06) % W);
    const dotY = H / 2 + Math.sin((dotX / W) * Math.PI * 3 + Date.now() * 0.0015) * 60;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffff00';
    ctx.fill();

    // Telemetry readouts
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#00ff88';
    const items = [
      `ALT: ${(408 + Math.sin(Date.now() * 0.0005) * 2).toFixed(1)} km`,
      `VEL: ${(7.66 + Math.random() * 0.01).toFixed(3)} km/s`,
      `INCL: 51.6°`,
      `T+: ${formatMET()}`,
      `O2: ${(99.2 + Math.random() * 0.1).toFixed(1)}%`,
      `CO2: ${(0.38 + Math.random() * 0.02).toFixed(3)}%`,
      `COMM: NOMINAL`,
      `DOCK: STANDBY`,
    ];
    items.forEach((txt, i) => ctx.fillText(txt, 10 + (i > 3 ? 260 : 0), 20 + (i % 4) * 16));

    // Title bar
    ctx.fillStyle = 'rgba(0,255,100,0.15)';
    ctx.fillRect(0, 0, W, 14);
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('FLIGHT OPERATIONS  •  ISS MISSION CONTROL  •  HOUSTON, TX', 8, 10);

    tex.needsUpdate = true;
  }

  return { tex, redraw };
}

function formatMET() {
  const s = Math.floor(Date.now() / 1000) % 86400;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${String(h).padStart(3,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// ── Console monitor texture ───────────────────────────────────────────────────
function buildConsoleTexture(hue) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 80;
  const ctx = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);

  function redraw() {
    ctx.fillStyle = '#020d04';
    ctx.fillRect(0, 0, 128, 80);
    ctx.font = '7px monospace';
    ctx.fillStyle = hue;
    for (let i = 0; i < 8; i++) {
      const val = (Math.random() * 100).toFixed(2);
      ctx.fillText(`CH${String(i+1).padStart(2,'0')} ${val}`, 4, 10 + i * 9);
    }
    tex.needsUpdate = true;
  }
  return { tex, redraw };
}

// ── Room shell ────────────────────────────────────────────────────────────────
function buildRoom(scene) {
  const W = 30, H = 6, D = 20;
  const floorMat   = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
  const ceilMat    = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.85 });
  const wallMat    = new THREE.MeshStandardMaterial({ color: 0x252525, roughness: 0.85 });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = H;
  scene.add(ceil);

  for (const [px, py, pz, roty, ww, wh] of [
    [0,  H/2, -D/2, 0,           W, H],   // back wall (big screen side)
    [0,  H/2,  D/2, Math.PI,     W, H],   // front wall
    [-W/2, H/2, 0, Math.PI/2,    D, H],   // left
    [ W/2, H/2, 0, -Math.PI/2,   D, H],   // right
  ]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), wallMat);
    wall.position.set(px, py, pz);
    wall.rotation.y = roty;
    wall.receiveShadow = true;
    scene.add(wall);
  }

  // Ceiling grid
  const gridMat = new THREE.LineBasicMaterial({ color: 0x444444 });
  for (let x = -W/2; x <= W/2; x += 2) {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, H - 0.01, -D/2), new THREE.Vector3(x, H - 0.01, D/2)]);
    scene.add(new THREE.LineSegments(g, gridMat));
  }
  for (let z = -D/2; z <= D/2; z += 2) {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-W/2, H - 0.01, z), new THREE.Vector3(W/2, H - 0.01, z)]);
    scene.add(new THREE.LineSegments(g, gridMat));
  }
}

// ── Console row ───────────────────────────────────────────────────────────────
function buildConsoleRow(scene, z, yOffset, redrawFns, interactables) {
  const ROW_W = 28;
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x1c2020, roughness: 0.85 });
  const desk = new THREE.Mesh(new THREE.BoxGeometry(ROW_W, 0.1, 2), deskMat);
  desk.position.set(0, yOffset + 0.8, z);
  desk.receiveShadow = true;
  desk.castShadow = true;
  scene.add(desk);

  // Chair behind desk
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  for (let cx = -ROW_W/2 + 2; cx <= ROW_W/2 - 2; cx += 4.5) {
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 8), chairMat);
    seat.position.set(cx, yOffset + 0.55, z + 1.4);
    scene.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 0.06), chairMat);
    back.position.set(cx, yOffset + 0.95, z + 1.74);
    scene.add(back);
  }

  // Monitors per console (one every 4.5 units) — only first row fully interactable to cap count
  const monitColors = ['#00ff44', '#ffaa00', '#00aaff'];
  for (let cx = -ROW_W/2 + 2; cx <= ROW_W/2 - 2; cx += 4.5) {
    for (let mi = 0; mi < 3; mi++) {
      const { tex, redraw } = buildConsoleTexture(monitColors[mi % 3]);
      redrawFns.push(redraw);

      const monMat = new THREE.MeshStandardMaterial({ map: tex, emissive: new THREE.Color(monitColors[mi % 3]).multiplyScalar(0.25), emissiveMap: tex });
      const mon = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.75, 0.05), monMat);
      mon.position.set(cx + (mi - 1) * 1.25, yOffset + 1.55, z - 0.6);
      mon.userData = { id: 'console', label: 'Flight Console', isInteractable: true };
      mon.castShadow = false;
      scene.add(mon);
      // Only register one monitor per console group to avoid label spam
      if (mi === 1) interactables.push(mon);
    }
  }
}

// ── Build full scene ──────────────────────────────────────────────────────────
export function getMissionControlScene() {
  if (scene) return { scene, interactables };

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0d10);
  interactables = [];

  const redrawFns = [];

  buildRoom(scene);

  // Stepped console tiers (6 rows, each row a bit higher toward back)
  for (let i = 0; i < 6; i++) {
    buildConsoleRow(scene, -5 + i * 2.8, i * 0.35, redrawFns, interactables);
  }

  // Big screen wall (back)
  const { tex, redraw } = buildBigScreenTexture();
  redrawFns.push(redraw);
  const screenMat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color(0x003315) });
  const bigScreen = new THREE.Mesh(new THREE.PlaneGeometry(26, 5), screenMat);
  bigScreen.position.set(0, 3.5, -9.9);
  bigScreen.userData = { id: 'bigscreen', label: 'Mission Status Display', isInteractable: true };
  scene.add(bigScreen);
  interactables.push(bigScreen);

  // Overhead spotlights
  const lightColors = [0xfff8f0, 0xfff8f0, 0xfff8f0, 0xfff8f0];
  for (const [lx, lz] of [[-8, -4], [8, -4], [-8, 6], [8, 6]]) {
    const spot = new THREE.SpotLight(0xfff8f0, 1.8, 18, Math.PI / 5, 0.4);
    spot.position.set(lx, 5.8, lz);
    spot.target.position.set(lx, 0, lz);
    spot.castShadow = false;
    scene.add(spot);
    scene.add(spot.target);
  }
  scene.add(new THREE.AmbientLight(0x1a2830, 1.2));

  // Telemetry redraw ticker (every 250ms)
  let lastUpdate = 0;
  registerTicker((_, elapsed) => {
    if (elapsed * 1000 - lastUpdate > 250) {
      for (const fn of redrawFns) fn();
      lastUpdate = elapsed * 1000;
    }
  });

  return { scene, interactables };
}
