import * as THREE from 'three';
import { registerTicker } from '../animation.js';

function buildFlag(x, z, color) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // Pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 12, 6),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 }),
  );
  pole.position.y = 6;
  pole.castShadow = true;
  group.add(pole);

  // Flag cloth — PlaneGeometry with enough segments to deform
  const flagGeo = new THREE.PlaneGeometry(2.4, 1.4, 12, 6);
  // Store base Y positions for wave animation
  const pos = flagGeo.attributes.position;
  const baseY = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) baseY[i] = pos.getY(i);

  const flag = new THREE.Mesh(
    flagGeo,
    new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.9, metalness: 0 }),
  );
  flag.position.set(1.2, 11, 0);  // attached to top of pole, extends right
  flag.castShadow = true;
  group.add(flag);
  group.userData = { id: 'flag', label: 'NASA Flag', isInteractable: true };
  flag.userData = { id: 'flag', label: 'NASA Flag', isInteractable: true };

  // Wave animation
  registerTicker((_, elapsed) => {
    const positions = flag.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      // Wave amplitude grows toward the free end (positive x)
      const t = (x + 1.2) / 2.4;
      const wave = Math.sin(x * 2.5 + elapsed * 3.0) * 0.12 * t;
      positions.setZ(i, wave);
    }
    positions.needsUpdate = true;
    flag.geometry.computeVertexNormals();
  });

  return { group, interactable: flag };
}

export function buildFlags(scene) {
  const interactables = [];
  const flagDefs = [
    { x: -4, z: -40, color: 0xcc2222 }, // US flag (simplified red)
    { x:  0, z: -40, color: 0x1155bb }, // NASA blue
    { x:  4, z: -40, color: 0xeeeeee }, // Texas white
  ];
  for (const { x, z, color } of flagDefs) {
    const { group, interactable } = buildFlag(x, z, color);
    scene.add(group);
    interactables.push(interactable);
  }
  return interactables;
}
