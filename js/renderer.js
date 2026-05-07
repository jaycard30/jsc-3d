import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

const canvas = document.getElementById('canvas');

export const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

export const css2DRenderer = new CSS2DRenderer();
css2DRenderer.setSize(window.innerWidth, window.innerHeight);
css2DRenderer.domElement.style.position = 'absolute';
css2DRenderer.domElement.style.top = '0';
css2DRenderer.domElement.style.left = '0';
css2DRenderer.domElement.style.width = '100%';
css2DRenderer.domElement.style.height = '100%';
css2DRenderer.domElement.style.pointerEvents = 'none';
document.getElementById('css2d-container').appendChild(css2DRenderer.domElement);

export function resizeRenderers() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  css2DRenderer.setSize(w, h);
}
