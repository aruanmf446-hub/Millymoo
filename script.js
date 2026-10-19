const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('open', !isOpen);
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeMenu();
});
window.matchMedia('(min-width: 701px)').addEventListener('change', closeMenu);
document.querySelector('#year').textContent = new Date().getFullYear();

// Conteúdo sempre visível: animações são um aprimoramento progressivo.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealTargets = document.querySelectorAll('.about > div, .section-heading, .service-list article, .steps article, .faq > div, .contact-inner > div, .story-intro');
let revealObserver;
function setupReveals() {
  revealObserver?.disconnect();
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (typeof entry.target.animate === 'function') {
        entry.target.animate([
          { opacity: 0.15, transform: 'translateY(28px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 720, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(element => revealObserver.observe(element));
}
const progressBar = document.querySelector('.reading-progress');
const heroArt = document.querySelector('.hero-art');
const story = document.querySelector('.brand-story');
const scenes = [...document.querySelectorAll('.story-scene')];
const manifesto = document.querySelector('.manifesto');
let scrollFrame = 0;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
function renderScroll() {
  scrollFrame = 0;
  if (motionPreference.matches) return;
  const vh = window.innerHeight;
  const y = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - vh;
  progressBar.style.transform = `scaleX(${maxScroll > 0 ? clamp(y / maxScroll) : 0})`;
  if (y < vh * 1.4) {
    const offset = clamp(y / vh) * (window.innerWidth < 701 ? 16 : 42);
    heroArt.style.transform = `translateY(${offset}px) rotate(${clamp(y / vh) * 2}deg)`;
  }
  const storyRect = story.getBoundingClientRect();
  if (storyRect.top < vh && storyRect.bottom > 0) {
    story.style.setProperty('--story-progress', clamp((vh - storyRect.top) / (storyRect.height + vh)));
    scenes.forEach((scene, index) => {
      const next = scenes[index + 1];
      const overlap = next ? clamp((vh * .7 - next.getBoundingClientRect().top) / (vh * .7)) : 0;
      scene.style.transform = `scale(${1 - overlap * .035})`;
    });
  }
  const manifestoRect = manifesto.getBoundingClientRect();
  if (manifestoRect.top < vh && manifestoRect.bottom > 0) {
    manifesto.style.setProperty('--manifesto-scale', 1 + clamp((vh - manifestoRect.top) / (vh + manifestoRect.height)) * 1.1);
  }
}
function scheduleScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(renderScroll);
}
window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('resize', scheduleScroll, { passive: true });
motionPreference.addEventListener('change', () => {
  document.getAnimations().forEach(animation => animation.cancel());
  heroArt.style.transform = '';
  scenes.forEach(scene => { scene.style.transform = ''; });
  setupReveals();
  scheduleScroll();
});
setupReveals();
scheduleScroll();
