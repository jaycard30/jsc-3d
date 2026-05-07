// Shared mutable state — imported by all modules that need cross-module coordination.
export const state = {
  activeScene: null,
  activeInteractables: [],
  currentLocation: 'exterior',   // 'exterior' | 'mc' | 'apollo' | 'training'
  transitioning: false,
  lastExteriorCamera: {
    position: null,   // THREE.Vector3
    target: null,     // THREE.Vector3
  },
};
