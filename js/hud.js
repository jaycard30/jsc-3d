const locationEl = document.getElementById('hud-location');
const backBtn = document.getElementById('hud-back');

let onBackCallback = null;

export function initHUD(onBack) {
  onBackCallback = onBack;
  backBtn.addEventListener('click', () => {
    if (onBackCallback) onBackCallback();
  });
}

export function showExterior() {
  locationEl.textContent = 'Johnson Space Center';
  backBtn.classList.add('hidden');
}

export function showInterior(name) {
  locationEl.textContent = name;
  backBtn.classList.remove('hidden');
}
