import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { renderer } from './renderer.js';
import { state } from './state.js';

export const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 200, 300);

let controls = null;

// Interior entry configs
const INTERIOR_CONFIG = {
  mc:       { name: 'Mission Control',        pos: [0, 3.5, 14], target: [0, 2, 0], minDist: 2,  maxDist: 22 },
  apollo:   { name: 'Apollo Exhibit Hall',    pos: [0, 4,   14], target: [0, 3, 0], minDist: 2,  maxDist: 20 },
  training: { name: 'Astronaut Training Bay', pos: [0, 5,   18], target: [0, 2, 0], minDist: 3,  maxDist: 28 },
};

// Building world positions (for fly-in approach)
const BUILDING_POS = {
  mc:       new THREE.Vector3(-20, 4,  -10),
  apollo:   new THREE.Vector3(-30, 6,   15),
  training: new THREE.Vector3( 10, 7,   20),
};

export function initControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor  = 0.08;
  controls.enablePan      = false;
  controls.rotateSpeed    = 0.5;
  controls.zoomSpeed      = 0.8;
  controls.minDistance    = 20;
  controls.maxDistance    = 250;
  controls.maxPolarAngle  = Math.PI * 0.48;
  controls.enabled        = false;
  return controls;
}

export function getControls() { return controls; }

export function enableOrbitExterior() {
  controls.enablePan     = false;
  controls.minDistance   = 20;
  controls.maxDistance   = 250;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.rotateSpeed   = 0.5;
  controls.zoomSpeed     = 0.8;
  controls.enabled       = true;
}

export function enableOrbitInterior() {
  controls.enablePan     = true;
  controls.panSpeed      = 0.4;
  controls.minDistance   = 2;
  controls.maxDistance   = 28;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.rotateSpeed   = 0.4;
  controls.zoomSpeed     = 0.6;
  controls.enabled       = true;
}

function tweenCam(toPos, toTarget, duration, ease, onComplete) {
  const gsap = window.gsap;
  const pos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  const tgt = { x: controls.target.x, y: controls.target.y, z: controls.target.z };

  gsap.to(pos, {
    x: toPos.x, y: toPos.y, z: toPos.z,
    duration, ease,
    onUpdate: () => {
      camera.position.set(pos.x, pos.y, pos.z);
      controls.update();
    },
  });
  gsap.to(tgt, {
    x: toTarget.x, y: toTarget.y, z: toTarget.z,
    duration, ease,
    onUpdate: () => controls.target.set(tgt.x, tgt.y, tgt.z),
    onComplete,
  });
}

export function runCinematicIntro(onComplete) {
  const gsap = window.gsap;
  camera.position.set(0, 200, 300);
  controls.target.set(0, 0, 0);
  controls.update();

  const tl = gsap.timeline({ onComplete });

  // Phase 1: pull back & descend (0→3s)
  tl.to(camera.position, { x: 0, y: 80, z: 180, duration: 3, ease: 'power2.inOut',
    onUpdate: () => controls.update() });
  tl.to(controls.target, { x: 0, y: 5, z: 0, duration: 3, ease: 'power2.inOut',
    onUpdate: () => controls.update() }, '<');

  // Phase 2: lateral drift (3→5s)
  tl.to(camera.position, { x: -20, y: 60, z: 160, duration: 2, ease: 'power1.inOut',
    onUpdate: () => controls.update() });
  tl.to(controls.target, { x: -5, y: 3, z: 0, duration: 2, ease: 'power1.inOut',
    onUpdate: () => controls.update() }, '<');

  // Phase 3: settle (5→7s)
  tl.to(camera.position, { x: 0, y: 45, z: 140, duration: 2, ease: 'power2.out',
    onUpdate: () => controls.update() });
  tl.to(controls.target, { x: 0, y: 0, z: 0, duration: 2, ease: 'power2.out',
    onUpdate: () => controls.update() }, '<');
}

export function transitionToInterior(buildingId, onSceneSwitch) {
  if (state.transitioning) return;
  state.transitioning = true;
  controls.enabled = false;

  const bPos = BUILDING_POS[buildingId];
  if (!bPos) return;

  // Save exterior camera state
  state.lastExteriorCamera.position = camera.position.clone();
  state.lastExteriorCamera.target = controls.target.clone();

  // Fly toward building face
  const approachPos = bPos.clone().add(new THREE.Vector3(0, 2, 18));

  tweenCam(approachPos, bPos, 1.0, 'power2.inOut', () => {
    // Swap scene
    onSceneSwitch(buildingId);

    // Teleport to interior start
    const cfg = INTERIOR_CONFIG[buildingId];
    camera.position.set(...cfg.pos);
    controls.target.set(...cfg.target);
    controls.update();

    enableOrbitInterior();
    state.transitioning = false;
  });
}

export function transitionToExterior(onSceneSwitch) {
  if (state.transitioning) return;
  state.transitioning = true;
  controls.enabled = false;

  // Drift camera to "door" before swapping
  const exitPos = camera.position.clone().add(new THREE.Vector3(0, 2, 6));
  tweenCam(exitPos, controls.target.clone(), 0.5, 'power2.in', () => {
    onSceneSwitch();

    // Restore exterior camera
    const savedPos = state.lastExteriorCamera.position || new THREE.Vector3(0, 45, 140);
    const savedTgt = state.lastExteriorCamera.target  || new THREE.Vector3(0, 0, 0);
    camera.position.copy(savedPos);
    controls.target.copy(savedTgt);
    controls.update();

    enableOrbitExterior();
    state.transitioning = false;
  });
}
