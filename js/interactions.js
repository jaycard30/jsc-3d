import * as THREE from 'three';
import { camera } from './camera.js';
import { state } from './state.js';
import { showLabel, dismiss } from './labels.js';

const raycaster = new THREE.Raycaster();
const pointer   = new THREE.Vector2();

let tapStart   = null;  // { x, y, t }
let onBuildingTap = null;

export function initInteractions(canvas, onBuilding) {
  onBuildingTap = onBuilding;

  canvas.addEventListener('pointerdown', (e) => {
    tapStart = { x: e.clientX, y: e.clientY, t: performance.now() };
  });

  canvas.addEventListener('pointerup', (e) => {
    if (!tapStart) return;
    const dx = e.clientX - tapStart.x;
    const dy = e.clientY - tapStart.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const elapsed = performance.now() - tapStart.t;
    tapStart = null;

    if (dist < 8 && elapsed < 280) {
      handleTap(e.clientX, e.clientY);
    }
  });

  canvas.addEventListener('pointercancel', () => { tapStart = null; });
}

function handleTap(clientX, clientY) {
  if (state.transitioning) return;

  pointer.x =  (clientX / window.innerWidth)  * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(state.activeInteractables, false);

  if (hits.length === 0) {
    dismiss();
    return;
  }

  const hit = hits[0].object;
  const { id, enterable, label, isBuilding } = hit.userData;

  if (!id) { dismiss(); return; }

  if (isBuilding && enterable && onBuildingTap) {
    dismiss();
    onBuildingTap(id);
    return;
  }

  // Show info label for non-enterable objects (or non-building interactables)
  showLabel(hit, id);
}
