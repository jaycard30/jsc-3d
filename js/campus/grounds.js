import * as THREE from 'three';

function makeMat(color, rough = 0.9) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 });
}

function addTree(scene, x, z) {
  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.25, 3.5, 6),
    makeMat(0x6b4c2a),
  );
  trunk.position.set(x, 1.75, z);
  trunk.castShadow = true;
  scene.add(trunk);

  // Canopy
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(2.2 + Math.random() * 0.5, 8, 6),
    makeMat(0x3a7a3a + Math.floor(Math.random() * 0x101010)),
  );
  canopy.position.set(x, 5, z);
  canopy.castShadow = true;
  scene.add(canopy);
}

export function buildGrounds(scene) {
  // Ground plane
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
    new THREE.MeshStandardMaterial({ color: 0x8ab07a, roughness: 0.95, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Paved central plaza
  const plaza = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 50),
    makeMat(0xb0a898, 0.92),
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.01, 0);
  plaza.receiveShadow = true;
  scene.add(plaza);

  // Entrance road (two strips)
  for (const xOff of [-3.5, 3.5]) {
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 55),
      makeMat(0x808080, 0.95),
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(xOff, 0.015, 22);
    road.receiveShadow = true;
    scene.add(road);
  }

  // Sidewalks
  const sidewalkDefs = [
    { w: 50, d: 2, x: 0,   z: -22 },
    { w: 2,  d: 40, x: 20, z: 0   },
    { w: 2,  d: 40, x: -20, z: 0  },
  ];
  for (const s of sidewalkDefs) {
    const sw = new THREE.Mesh(
      new THREE.PlaneGeometry(s.w, s.d),
      makeMat(0xc0b8a8, 0.9),
    );
    sw.rotation.x = -Math.PI / 2;
    sw.position.set(s.x, 0.012, s.z);
    sw.receiveShadow = true;
    scene.add(sw);
  }

  // Reflecting pool
  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 8),
    new THREE.MeshStandardMaterial({
      color: 0x6fa8c0,
      roughness: 0.05,
      metalness: 0.15,
      transparent: true,
      opacity: 0.9,
    }),
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0, 0.05, -22);
  pool.receiveShadow = false;
  pool.userData = { id: 'pool', label: 'Reflecting Pool', isInteractable: true };
  scene.add(pool);

  // Pool border
  const poolBorderMat = makeMat(0xd4cfc4, 0.85);
  for (const [bx, bz, bw, bd] of [
    [0, -26.5, 16, 1], [0, -17.5, 16, 1],
    [-7.5, -22, 1, 10], [7.5, -22, 1, 10],
  ]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.25, bd), poolBorderMat);
    b.position.set(bx, 0.12, bz);
    b.receiveShadow = true;
    scene.add(b);
  }

  // Trees scattered around campus
  const treePositions = [
    [-12, -35], [12, -35], [-25, -25], [25, -25],
    [-35, 5], [35, 5], [-35, 30], [35, 30],
    [-15, 38], [15, 38], [0, 45], [-50, 10],
    [50, 10], [45, -20], [-45, -20], [-8, -42],
    [8, -42], [50, 40], [-50, 40], [0, -50],
  ];
  for (const [tx, tz] of treePositions) addTree(scene, tx, tz);

  return pool; // pool is interactable
}
