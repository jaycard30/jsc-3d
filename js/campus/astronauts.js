import * as THREE from 'three';

const suitMat = new THREE.MeshStandardMaterial({ color: 0xf0f0e8, roughness: 0.8, metalness: 0.05 });
const helmetMat = new THREE.MeshStandardMaterial({ color: 0xd0e8f4, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.88 });
const visorMat = new THREE.MeshStandardMaterial({ color: 0xffcc44, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.6 });

function buildAstronaut(x, z, rot = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;

  const add = (geo, mat, py, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.y = py;
    m.scale.set(sx, sy, sz);
    m.castShadow = true;
    g.add(m);
    return m;
  };

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.13, 0.12, 0.9, 6);
  add(legGeo, suitMat, 0.45, 1, 1, 1).position.x = -0.16;
  add(legGeo, suitMat, 0.45, 1, 1, 1).position.x =  0.16;

  // Boots
  const bootGeo = new THREE.BoxGeometry(0.22, 0.12, 0.3);
  const bootMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
  for (const bx of [-0.16, 0.16]) {
    const b = new THREE.Mesh(bootGeo, bootMat);
    b.position.set(bx, 0.06, 0.04);
    b.castShadow = true;
    g.add(b);
  }

  // Torso / PLSS pack
  const torso = add(new THREE.BoxGeometry(0.55, 0.8, 0.42), suitMat, 1.4);
  const plss = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.6, 0.18), new THREE.MeshStandardMaterial({ color: 0xe8e4e0, roughness: 0.85 }));
  plss.position.set(0, 1.4, -0.3);
  plss.castShadow = true;
  g.add(plss);

  // Arms
  const armGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.65, 6);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(armGeo, suitMat);
    arm.rotation.z = side * 0.35;
    arm.position.set(side * 0.38, 1.45, 0);
    arm.castShadow = true;
    g.add(arm);

    const glove = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), new THREE.MeshStandardMaterial({ color: 0xf0e8d0, roughness: 0.7 }));
    glove.position.set(side * 0.5, 1.15, 0);
    g.add(glove);
  }

  // Neck ring
  add(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.7 }), 1.92);

  // Helmet
  add(new THREE.SphereGeometry(0.24, 10, 8), helmetMat, 2.18);

  // Visor (front half)
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8, 0, Math.PI), visorMat);
  visor.rotation.y = -Math.PI / 2;
  visor.position.set(0.12, 2.18, 0);
  g.add(visor);

  g.userData = { id: 'astronaut', label: 'NASA Astronaut', isInteractable: true };
  torso.userData = { id: 'astronaut', label: 'NASA Astronaut', isInteractable: true };

  return { group: g, interactable: torso };
}

export function buildAstronauts(scene) {
  const interactables = [];
  const positions = [
    [-6, 5, 0.6],  [-4, 2, -0.4], [5, -8, 1.2],
    [18, 15, 2.0], [-18, 8, -1.0], [3, 30, 0.8],
  ];
  for (const [x, z, rot] of positions) {
    const { group, interactable } = buildAstronaut(x, z, rot);
    scene.add(group);
    interactables.push(interactable);
  }
  return interactables;
}
