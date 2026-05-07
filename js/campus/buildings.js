import * as THREE from 'three';

// Each entry: id, size [w,h,d], pos [x,y,z], color, glass color
const BUILDING_DEFS = [
  { id: 'mc',       label: 'Mission Control',       size: [18, 8,  14], pos: [-20,  4, -10], color: 0xc8b89a, glass: 0x7ab8d4, enterable: true  },
  { id: 'saturnV',  label: 'Saturn V Facility',     size: [30, 22, 30], pos: [25,  11,  -5], color: 0x9aacb8, glass: 0x8ab4c8, enterable: false },
  { id: 'apollo',   label: 'Apollo Exhibit Hall',   size: [22, 12, 18], pos: [-30,  6,  15], color: 0xd4c9b0, glass: 0x6aadcc, enterable: true  },
  { id: 'training', label: 'Astronaut Training Bay',size: [26, 14, 24], pos: [10,   7,  20], color: 0xb0bcc4, glass: 0x7ab8d4, enterable: true  },
  { id: 'admin',    label: 'Admin Headquarters',    size: [14, 10, 10], pos: [-5,   5, -30], color: 0xccc0a8, glass: 0x8ab4c8, enterable: false },
  { id: 'visitor',  label: 'Visitor Center',        size: [16,  6, 12], pos: [40,   3,  25], color: 0xd8e0e8, glass: 0x9ac8dc, enterable: false },
];

function glassStrip(w, h, d, color) {
  // A thin horizontal band of "windows" across the front face
  const geo = new THREE.BoxGeometry(w - 0.4, h * 0.22, 0.12);
  const mat = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.6,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
    envMapIntensity: 1.2,
  });
  return new THREE.Mesh(geo, mat);
}

function buildBuilding(def) {
  const group = new THREE.Group();
  const [w, h, d] = def.size;

  // Main body
  const bodyMat = new THREE.MeshStandardMaterial({
    color: def.color,
    roughness: 0.85,
    metalness: 0.05,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Flat roof accent (slightly darker slab)
  const roofMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(def.color).multiplyScalar(0.75), roughness: 0.9 });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.3, d + 0.2), roofMat);
  roof.position.y = h / 2 + 0.15;
  roof.receiveShadow = true;
  group.add(roof);

  // Glass strip (front, mid-height)
  const strip = glassStrip(w, h, d, def.glass);
  strip.position.set(0, h * 0.1, d / 2 + 0.07);
  group.add(strip);

  // Entrance recess
  const doorW = Math.min(4, w * 0.28);
  const doorH = Math.min(3.5, h * 0.44);
  const recessMat = new THREE.MeshStandardMaterial({ color: 0x333a40, roughness: 0.7 });
  const recess = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.6), recessMat);
  recess.position.set(0, -h / 2 + doorH / 2, d / 2 + 0.35);
  group.add(recess);

  group.position.set(...def.pos);
  group.userData = { id: def.id, label: def.label, enterable: def.enterable, isBuilding: true };

  // The interactable mesh for raycasting is the body
  body.userData = { id: def.id, label: def.label, enterable: def.enterable, isBuilding: true };

  return { group, interactable: body };
}

export function buildAllBuildings(scene) {
  const interactables = [];
  for (const def of BUILDING_DEFS) {
    const { group, interactable } = buildBuilding(def);
    scene.add(group);
    interactables.push(interactable);
  }
  return interactables;
}
