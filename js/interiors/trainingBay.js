import * as THREE from 'three';

let scene = null;
let interactables = [];

function buildRoom(scene) {
  const W = 40, H = 12, D = 36;
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x707878, roughness: 0.92 });
  const ceilMat  = new THREE.MeshStandardMaterial({ color: 0x909898, roughness: 0.88 });
  const wallMat  = new THREE.MeshStandardMaterial({ color: 0x909898, roughness: 0.88 });

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

function buildSuitStand(scene, x, z) {
  const suitMat = new THREE.MeshStandardMaterial({ color: 0xf0f0e8, roughness: 0.8, metalness: 0.05 });
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  // Stand pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.5, 6),
    new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.7, roughness: 0.4 }));
  pole.position.y = 0.75;
  g.add(pole);

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.4, 1.1, 8), suitMat);
  torso.position.y = 1.95;
  g.add(torso);

  // Helmet
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xe8f0f8, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.9 }));
  helm.position.y = 2.8;
  g.add(helm);

  // Arms (horizontal)
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.75, 6), suitMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(side * 0.62, 2.05, 0);
    g.add(arm);
  }

  // Base plate
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 })));

  scene.add(g);

  torso.userData = { id: 'suit', label: 'EVA Spacesuit Stand', isInteractable: true };
  g.userData = { id: 'suit', label: 'EVA Spacesuit Stand', isInteractable: true };
  return torso;
}

export function getTrainingBayScene() {
  if (scene) return { scene, interactables };

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x707878);
  interactables = [];

  buildRoom(scene);

  // ── NBL Pool ──────────────────────────────────────────────────────────────
  const poolMat = new THREE.MeshStandardMaterial({
    color: 0x1a5070,
    roughness: 0.08,
    metalness: 0.12,
    transparent: true,
    opacity: 0.88,
  });
  const pool = new THREE.Mesh(new THREE.BoxGeometry(20, 0.4, 28), poolMat);
  pool.position.set(0, -0.2, -1);
  pool.receiveShadow = false;
  pool.userData = { id: 'nblpool', label: 'Neutral Buoyancy Lab (NBL)', isInteractable: true };
  scene.add(pool);
  interactables.push(pool);

  // Pool edge / safety railing (yellow)
  const railMat = new THREE.LineBasicMaterial({ color: 0xffcc00 });
  const railCorners = [
    new THREE.Vector3(-10, 0.22, -15), new THREE.Vector3(10, 0.22, -15),
    new THREE.Vector3(10, 0.22,  13), new THREE.Vector3(-10, 0.22, 13),
    new THREE.Vector3(-10, 0.22, -15),
  ];
  const railGeo = new THREE.BufferGeometry().setFromPoints(railCorners);
  scene.add(new THREE.Line(railGeo, railMat));

  // Pool concrete surround
  const concMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.92 });
  for (const [px, pz, pw, pd] of [
    [0, -17, 24, 4], [0, 16, 24, 4],
    [-12, -1, 4, 32], [12, -1, 4, 32],
  ]) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(pw, pd), concMat);
    s.rotation.x = -Math.PI / 2;
    s.position.set(px, 0.01, pz);
    s.receiveShadow = true;
    scene.add(s);
  }

  // ── Pool crane ────────────────────────────────────────────────────────────
  const craneMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.5, roughness: 0.5 });
  const craneVert = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 10, 8), craneMat);
  craneVert.position.set(-16, 5, -5);
  craneVert.castShadow = true;
  scene.add(craneVert);

  const craneArm = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 0.4), craneMat);
  craneArm.position.set(-9, 10.5, -5);
  craneArm.castShadow = true;
  craneArm.userData = { id: 'crane', label: 'NBL Overhead Crane', isInteractable: true };
  scene.add(craneArm);
  interactables.push(craneArm);

  // Hook cable
  const hookGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-2, 10.3, -5), new THREE.Vector3(-2, 3, -5),
  ]);
  scene.add(new THREE.Line(hookGeo, new THREE.LineBasicMaterial({ color: 0x888888 })));

  // ── EVA Suit stands ───────────────────────────────────────────────────────
  for (const [sx, sz] of [[-14, -10], [-14, 0], [14, -10], [14, 0]]) {
    const torso = buildSuitStand(scene, sx, sz);
    interactables.push(torso);
  }

  // ── Equipment racks ───────────────────────────────────────────────────────
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x555a5f, roughness: 0.85 });
  const rackPositions = [[-16, -14], [-16, -6], [-16, 6], [16, -14], [16, -6], [16, 6]];
  for (const [rx, rz] of rackPositions) {
    const rack = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 0.8), rackMat);
    rack.position.set(rx, 1.25, rz);
    rack.castShadow = true;
    rack.userData = { id: 'rack', label: 'Training Equipment Rack', isInteractable: true };
    scene.add(rack);
    interactables.push(rack);

    // Shelf dividers
    for (let sh = 0; sh < 3; sh++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.05, 0.75),
        new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 }));
      shelf.position.set(rx, 0.5 + sh * 0.85, rz);
      scene.add(shelf);
    }
  }

  // ── Overhead lights ───────────────────────────────────────────────────────
  for (const [lx, lz] of [[-10, -10], [0, -10], [10, -10], [-10, 5], [0, 5], [10, 5]]) {
    const pt = new THREE.PointLight(0xfff8e8, 1.8, 24);
    pt.position.set(lx, 11.5, lz);
    pt.castShadow = false;
    scene.add(pt);

    // Light fixture
    const fix = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 0.8 }));
    fix.position.set(lx, 11.88, lz);
    scene.add(fix);
  }
  scene.add(new THREE.AmbientLight(0x8090a0, 0.8));

  return { scene, interactables };
}
