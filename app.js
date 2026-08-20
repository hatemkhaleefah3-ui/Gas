const appShell = document.querySelector('.app-shell');
const desktopNavButtons = [...document.querySelectorAll('[data-view-target]')];
const screens = [...document.querySelectorAll('[data-screen]')];
const fuelButtons = [...document.querySelectorAll('[data-fuel]')];
const railDots = [...document.querySelectorAll('[data-rail-target]')];
const dockButtons = [...document.querySelectorAll('[data-dock-target]')];
const searchInput = document.querySelector('#stationSearch');
const stationCards = [...document.querySelectorAll('.station-card')];
const emptyState = document.querySelector('#emptyState');
const heroPrice = document.querySelector('#heroPrice');
const heroFuel = document.querySelector('#heroFuel');
const toast = document.querySelector('#toast');

const fuelAverages = {
  Regular: '$3.42',
  Premium: '$4.08',
  Diesel: '$3.91'
};

let currentFuel = 'Regular';
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function setFuel(fuel) {
  currentFuel = fuel;
  fuelButtons.forEach((button) => {
    const active = button.dataset.fuel === fuel;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  heroPrice.textContent = fuelAverages[fuel];
  heroFuel.textContent = `${fuel.toUpperCase()} / GAL`;

  stationCards.forEach((card) => {
    const key = fuel.toLowerCase();
    const price = card.dataset[key];
    card.querySelector('.station-fuel-label').textContent = fuel;
    card.querySelector('.station-price').textContent = `$${price}`;
  });

  showToast(`${fuel} prices loaded`);
}

fuelButtons.forEach((button) => {
  button.addEventListener('click', () => setFuel(button.dataset.fuel));
});

function goToScreen(index, behavior = 'smooth') {
  const screen = screens[index];
  if (!screen) return;

  if (window.matchMedia('(min-width: 1100px)').matches) {
    screen.scrollIntoView({ behavior, block: 'start' });
  } else {
    appShell.scrollTo({ left: index * appShell.clientWidth, behavior });
  }
}

desktopNavButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const index = screens.findIndex((screen) => screen.dataset.screen === button.dataset.viewTarget);
    goToScreen(index);
  });
});

railDots.forEach((dot) => {
  dot.addEventListener('click', () => goToScreen(Number(dot.dataset.railTarget)));
});

dockButtons.forEach((button) => {
  button.addEventListener('click', () => goToScreen(Number(button.dataset.dockTarget)));
});

function updateNavigation(index) {
  const currentName = screens[index]?.dataset.screen;

  desktopNavButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.viewTarget === currentName);
  });

  railDots.forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === index);
  });

  dockButtons.forEach((button, buttonIndex) => {
    button.classList.toggle('is-active', buttonIndex === index);
  });
}

let scrollFrame;
appShell.addEventListener('scroll', () => {
  if (window.matchMedia('(min-width: 1100px)').matches) return;
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(() => {
    const index = Math.round(appShell.scrollLeft / appShell.clientWidth);
    updateNavigation(index);
  });
}, { passive: true });

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    if (!window.matchMedia('(min-width: 1100px)').matches) return;
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const index = screens.indexOf(visible.target);
    if (index >= 0) updateNavigation(index);
  }, { threshold: [0.25, 0.5, 0.7] });

  screens.forEach((screen) => observer.observe(screen));
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  stationCards.forEach((card) => {
    const haystack = `${card.dataset.name} ${card.dataset.area}`.toLowerCase();
    const matches = haystack.includes(query);
    card.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  emptyState.hidden = visibleCount !== 0;
});

document.querySelectorAll('.save-button').forEach((button) => {
  button.addEventListener('click', () => {
    const saved = button.getAttribute('aria-pressed') === 'true';
    const next = !saved;
    button.setAttribute('aria-pressed', String(next));
    button.textContent = next ? '★' : '☆';
    showToast(next ? 'Station saved' : 'Station removed');
  });
});

// Keyboard affordances complement the device-specific controls.
document.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLInputElement) return;
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;

  const isPaged = window.matchMedia('(max-width: 1099px)').matches;
  if (!isPaged) return;

  const currentIndex = Math.round(appShell.scrollLeft / appShell.clientWidth);
  const direction = event.key === 'ArrowRight' ? 1 : -1;
  const nextIndex = Math.max(0, Math.min(screens.length - 1, currentIndex + direction));
  goToScreen(nextIndex);
});

// Reset horizontal position when crossing desktop/tablet/mobile breakpoints.
let lastMode = getMode();
function getMode() {
  if (window.matchMedia('(min-width: 1100px)').matches) return 'desktop';
  if (window.matchMedia('(min-width: 768px)').matches) return 'tablet';
  return 'mobile';
}

window.addEventListener('resize', () => {
  const mode = getMode();
  if (mode === lastMode) return;
  lastMode = mode;
  appShell.scrollTo({ left: 0, behavior: 'auto' });
  updateNavigation(0);
});

setFuel(currentFuel);
