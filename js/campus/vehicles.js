import * as THREE from 'three';

function mat(color, rough = 0.6, metal = 0.1) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}

// Lunar Rover replica
function buildRover(x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 1.4), mat(0xd4c080));
  chassis.position.y = 0.65;
  chassis.castShadow = true;
  g.add(chassis);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 1.0), mat(0x8a7a50));
  seat.position.set(-0.3, 1.05, 0);
  g.add(seat);

  // Wheels (4x)
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.18, 10);
  const wheelMat = mat(0x555555, 0.9, 0);
  for (const [wx, wz] of [[-0.9, -0.8], [0.9, -0.8], [-0.9, 0.8], [0.9, 0.8]]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(wx, 0.38, wz);
    w.castShadow = true;
    g.add(w);
  }

  // Antenna
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4), mat(0xaaaaaa, 0.5, 0.5));
  ant.position.set(0.8, 1.45, -0.3);
  g.add(ant);

  g.userData = { id: 'rover', label: 'Lunar Rover', isInteractable: true };
  chassis.userData = { id: 'rover', label: 'Lunar Rover', isInteractable: true };

  return { group: g, interactable: chassis };
}

// NASA utility truck
function buildTruck(x, z, rot = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;

  const body = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 2.2), mat(0x2244aa, 0.7));
  body.position.y = 1.15;
  body.castShadow = true;
  g.add(body);

  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 2.1), mat(0x2244aa, 0.7));
  cab.position.set(-1.2, 2.15, 0);
  cab.castShadow = true;
  g.add(cab);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 1.6), mat(0x99ccee, 0.1, 0.4));
  windshield.position.set(-0.4, 2.15, 0);
  g.add(windshield);

  const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 10);
  const wheelMat = mat(0x222222, 0.95, 0);
  for (const [wx, wz] of [[-1.2, -1.1], [1.0, -1.1], [-1.2, 1.1], [1.0, 1.1]]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(wx, 0.45, wz);
    w.castShadow = true;
    g.add(w);
  }

  g.userData = { id: 'truck', label: 'NASA Ground Support Vehicle', isInteractable: true };
  body.userData = { id: 'truck', label: 'NASA Ground Support Vehicle', isInteractable: true };

  return { group: g, interactable: body };
}

// Shuttle replica (simplified)
function buildShuttleReplica(x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = 0.3;

  // Orbiter fuselage
  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.6, 12, 8), mat(0xe8e4dc, 0.8));
  fuselage.rotation.z = Math.PI / 2;
  fuselage.position.y = 4;
  fuselage.castShadow = true;
  g.add(fuselage);

  // Nose cone
  const nose = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3, 8), mat(0xe8e4dc, 0.8));
  nose.rotation.z = -Math.PI / 2;
  nose.position.set(7.5, 4, 0);
  nose.castShadow = true;
  g.add(nose);

  // Wings
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.2, 4),
      mat(0xd0ccc4, 0.85),
    );
    wing.position.set(-1, 3.5, side * 4);
    wing.rotation.z = side * 0.08;
    wing.castShadow = true;
    g.add(wing);
  }

  // Vertical tail
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 3), mat(0xe8e4dc, 0.8));
  tail.position.set(-5, 6, 0);
  tail.castShadow = true;
  g.add(tail);

  // External tank (orange)
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 14, 10), mat(0xc84a10, 0.85));
  tank.rotation.z = Math.PI / 2;
  tank.position.set(0, 1.8, 3.8);
  tank.castShadow = true;
  g.add(tank);

  // SRBs
  for (const side of [-1, 1]) {
    const srb = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 14, 8), mat(0xcccccc, 0.8));
    srb.rotation.z = Math.PI / 2;
    srb.position.set(0, 1.8, side * 7.2);
    srb.castShadow = true;
    g.add(srb);
  }

  // Pedestal
  const ped = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 8), mat(0x888888, 0.9));
  ped.position.y = 2;
  ped.castShadow = true;
  ped.receiveShadow = true;
  g.add(ped);

  g.userData = { id: 'shuttle', label: 'Space Shuttle Replica', isInteractable: true };
  fuselage.userData = { id: 'shuttle', label: 'Space Shuttle Replica', isInteractable: true };

  return { group: g, interactable: fuselage };
}

export function buildVehicles(scene) {
  const interactables = [];

  const r1 = buildRover(-8, 8);
  scene.add(r1.group);
  interactables.push(r1.interactable);

  const r2 = buildRover(8, -5);
  scene.add(r2.group);
  interactables.push(r2.interactable);

  const t1 = buildTruck(-40, 5, 0.4);
  scene.add(t1.group);
  interactables.push(t1.interactable);

  const t2 = buildTruck(30, 35, -0.3);
  scene.add(t2.group);
  interactables.push(t2.interactable);

  const sh = buildShuttleReplica(50, -25);
  scene.add(sh.group);
  interactables.push(sh.interactable);

  return interactables;
}
