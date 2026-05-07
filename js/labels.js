import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { facts } from './data/facts.js';

let activeObject = null;
let activeCSSObj = null;

export function showLabel(mesh, factKey) {
  if (activeObject === mesh) {
    dismiss();
    return;
  }
  dismiss();

  const data = facts[factKey];
  if (!data) return;

  const div = document.createElement('div');
  div.className = 'info-label';
  div.innerHTML = `
    <span class="label-title">${data.label}</span>
    <p class="label-fact">${data.fact}</p>
    <button class="label-close" aria-label="Close">&#x2715;</button>
  `;
  div.querySelector('.label-close').addEventListener('click', (e) => {
    e.stopPropagation();
    dismiss();
  });

  const cssObj = new CSS2DObject(div);

  // Float above the mesh bounding box
  mesh.geometry.computeBoundingBox();
  const bb = mesh.geometry.boundingBox;
  const topY = bb ? bb.max.y + 0.8 : 2;
  cssObj.position.set(0, topY, 0);

  mesh.add(cssObj);
  activeCSSObj = cssObj;
  activeObject = mesh;
}

export function dismiss() {
  if (activeCSSObj) {
    activeCSSObj.element.remove();
    if (activeCSSObj.parent) activeCSSObj.parent.remove(activeCSSObj);
    activeCSSObj = null;
  }
  activeObject = null;
}

export function getActiveObject() {
  return activeObject;
}
