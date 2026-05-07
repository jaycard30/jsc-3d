import * as THREE from 'three';

import { renderer, css2DRenderer, resizeRenderers } from './renderer.js';
import { camera, initControls, getControls, runCinematicIntro, enableOrbitExterior, transitionToInterior, transitionToExterior } from './camera.js';
import { buildEnvironment } from './environment.js';
import { buildAllBuildings } from './campus/buildings.js';
import { buildGrounds } from './campus/grounds.js';
import { buildVehicles } from './campus/vehicles.js';
import { buildFlags } from './campus/flags.js';
import { buildAstronauts } from './campus/astronauts.js';
import { getMissionControlScene } from './interiors/missionControl.js';
import { getApolloHallScene } from './interiors/apolloHall.js';
import { getTrainingBayScene } from './interiors/trainingBay.js';
import { initInteractions } from './interactions.js';
import { initHUD, showExterior, showInterior } from './hud.js';
import { dismiss as dismissLabel } from './labels.js';
import { runTickers } from './animation.js';
import { state } from './state.js';

// ── Build exterior scene ───────────────────────────────────────────────────────
const exteriorScene = new THREE.Scene();
buildEnvironment(exteriorScene);

const buildingInteractables = buildAllBuildings(exteriorScene);
const pool                  = buildGrounds(exteriorScene);
const vehicleInteractables  = buildVehicles(exteriorScene);
const flagInteractables     = buildFlags(exteriorScene);
const astronautInteractables = buildAstronauts(exteriorScene);

const exteriorInteractables = [
  ...buildingInteractables,
  pool,
  ...vehicleInteractables,
  ...flagInteractables,
  ...astronautInteractables,
];

// ── State init ────────────────────────────────────────────────────────────────
state.activeScene        = exteriorScene;
state.activeInteractables = exteriorInteractables;
state.currentLocation    = 'exterior';

// ── Scene switch helpers ──────────────────────────────────────────────────────
const INTERIOR_BUILDERS = {
  mc:       getMissionControlScene,
  apollo:   getApolloHallScene,
  training: getTrainingBayScene,
};
const INTERIOR_NAMES = {
  mc:       'Mission Control',
  apollo:   'Apollo Exhibit Hall',
  training: 'Astronaut Training Bay',
};

function switchToInterior(id) {
  const { scene, interactables } = INTERIOR_BUILDERS[id]();
  state.activeScene        = scene;
  state.activeInteractables = interactables;
  state.currentLocation    = id;
  showInterior(INTERIOR_NAMES[id]);
}

function switchToExterior() {
  state.activeScene        = exteriorScene;
  state.activeInteractables = exteriorInteractables;
  state.currentLocation    = 'exterior';
  showExterior();
}

// ── Controls ──────────────────────────────────────────────────────────────────
const controls = initControls();

// ── HUD ───────────────────────────────────────────────────────────────────────
initHUD(() => {
  dismissLabel();
  transitionToExterior(switchToExterior);
});

// ── Interactions ──────────────────────────────────────────────────────────────
initInteractions(renderer.domElement, (buildingId) => {
  transitionToInterior(buildingId, switchToInterior);
});

// ── Resize ────────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  resizeRenderers();
});

// ── Animation loop ────────────────────────────────────────────────────────────
const clock = new THREE.Clock();
let elapsed = 0;

renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();
  elapsed += delta;

  runTickers(delta, elapsed);
  controls.update();
  renderer.render(state.activeScene, camera);
  css2DRenderer.render(state.activeScene, camera);
});

// ── Cinematic intro ───────────────────────────────────────────────────────────
const loadingEl = document.getElementById('loading');

// Brief delay so the first frame renders before fading the loader
setTimeout(() => {
  loadingEl.classList.add('hidden');

  runCinematicIntro(() => {
    enableOrbitExterior();
  });
}, 400);
