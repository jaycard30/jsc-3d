import * as THREE from 'three';

let scene = null;
let interactables = [];

function buildRoom(scene) {
  const W = 28, H = 10, D = 22;
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xc0b8a8, roughness: 0.75 });
  const ceilMat  = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.9  });
  const wallMat  = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.9  });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = H;
  scene.add(ceil);

  for (const [px, py, pz, roty, ww, wh] of [
    [0,  H/2, -D/2, 0,           W, H],
    [0,  H/2,  D/2, Math.PI,     W, H],
    [-W/2, H/2, 0, Math.PI/2,    D, H],
    [ W/2, H/2, 0, -Math.PI/2,   D, H],
  ]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), wallMat);
    wall.position.set(px, py, pz);
    wall.rotation.y = roty;
    wall.receiveShadow = true;
    scene.add(wall);
  }
}

function buildPanelTexture(title, lines) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 192;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f8f4ee';
  ctx.fillRect(0, 0, 256, 192);
  ctx.fillStyle = '#1a2a5a';
  ctx.fillRect(0, 0, 256, 28);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(title, 8, 19);
  ctx.fillStyle = '#222';
  ctx.font = '11px sans-serif';
  lines.forEach((l, i) => ctx.fillText(l, 8, 44 + i * 16));
  return new THREE.CanvasTexture(c);
}

export function getApolloHallScene() {
  if (scene) return { scene, interactables };

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0ece4);
  interactables = [];

  buildRoom(scene);

  // ── Apollo Command Module ──────────────────────────────────────────────────
  // Plinth
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.4, metalness: 0.05 });
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(8, 0.8, 8), plinthMat);
  plinth.position.set(0, 0.4, -2);
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  scene.add(plinth);

  // Main capsule body (truncated sphere via scale)
  const cmMat = new THREE.MeshStandardMaterial({
    color: 0x3a3020,
    roughness: 0.82,
    metalness: 0.32,
  });
  const capsule = new THREE.Mesh(new THREE.SphereGeometry(2.8, 18, 14), cmMat);
  capsule.scale.set(1, 0.62, 1);
  capsule.position.set(0, 3.3, -2);
  capsule.castShadow = true;
  capsule.userData = { id: 'capsule', label: 'Apollo Command Module', isInteractable: true };
  scene.add(capsule);
  interactables.push(capsule);

  // Heat shield (inverted cone)
  const hsMat = new THREE.MeshStandardMaterial({ color: 0x2a2010, roughness: 0.95, metalness: 0.1 });
  const heatShield = new THREE.Mesh(new THREE.ConeGeometry(2.85, 0.9, 18), hsMat);
  heatShield.rotation.z = Math.PI;
  heatShield.position.set(0, 1.4, -2);
  heatShield.castShadow = true;
  heatShield.userData = { id: 'heatshield', label: 'Apollo Heat Shield', isInteractable: true };
  scene.add(heatShield);
  interactables.push(heatShield);

  // ── Rope barrier ──────────────────────────────────────────────────────────
  const postMat = new THREE.MeshStandardMaterial({ color: 0x8a7040, metalness: 0.5, roughness: 0.4 });
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xcc3322, roughness: 0.9 });
  const postPositions = [[-5, -6], [5, -6], [5, 2], [-5, 2]];
  for (const [px, pz] of postPositions) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6), postMat);
    post.position.set(px, 0.55, pz);
    post.castShadow = true;
    scene.add(post);
  }
  // Rope segments between posts
  const rCorners = postPositions.map(([px, pz]) => new THREE.Vector3(px, 0.9, pz));
  rCorners.push(rCorners[0]); // close loop
  for (let i = 0; i < 4; i++) {
    const from = rCorners[i], to = rCorners[i + 1];
    const mid = from.clone().lerp(to, 0.5);
    mid.y -= 0.08;
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const ropePts = curve.getPoints(12);
    const ropeGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ropePts), 12, 0.025, 5);
    scene.add(new THREE.Mesh(ropeGeo, ropeMat));
  }

  // ── Exhibit panels ────────────────────────────────────────────────────────
  const panels = [
    { x: -12, z: -3, title: 'Apollo Program', lines: ['Missions: Apollo 1–17', '1961–1972', '12 moonwalkers', '842 lbs of lunar samples', 'Cost: $25.4 billion (1973$)'] },
    { x:  12, z: -3, title: 'Command Module', lines: ['Height: 3.22 m', 'Diameter: 3.91 m', 'Mass: 5,806 kg', 'Crew: 3 astronauts', 'Built by: North American Aviation'] },
    { x:   0, z: -10.8, title: 'Apollo 11 — 1969', lines: ['First crewed Moon landing', 'July 20, 1969 at 20:17 UTC', 'Crew: Armstrong, Aldrin, Collins', '"One giant leap for mankind"', 'Splashdown: July 24, 1969'] },
  ];
  for (const { x, z, title, lines } of panels) {
    const tex = buildPanelTexture(title, lines);
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 2.5),
      new THREE.MeshStandardMaterial({ map: tex }),
    );
    panel.position.set(x, 3, z);
    if (z < -5) panel.rotation.y = 0;
    else panel.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    panel.userData = { id: 'panel', label: title, isInteractable: true };
    scene.add(panel);
    interactables.push(panel);
  }

  // ── Spotlights on capsule ─────────────────────────────────────────────────
  for (const [lx, lz] of [[-4, 2], [4, 2], [0, 3]]) {
    const spot = new THREE.SpotLight(0xfff8e8, 3, 20, Math.PI / 7, 0.35);
    spot.position.set(lx, 9.5, lz);
    spot.target.position.set(0, 3, -2);
    spot.castShadow = false;
    scene.add(spot);
    scene.add(spot.target);
  }
  scene.add(new THREE.AmbientLight(0xfff8f0, 1.0));
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd4c8b0, 0.5));

  return { scene, interactables };
}
