const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#nav');
function closeMenu(restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  navigation.classList.remove('open');
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  navigation.classList.toggle('open', open);
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) closeMenu(true);
});
window.matchMedia('(min-width:701px)').addEventListener('change', () => closeMenu());

// Carrossel real: rolagem nativa, toque, teclado e avanço automático visível.
const carouselShell = document.querySelector('.carousel-shell');
const carousel = document.querySelector('.carousel');
const slides = [...carousel.querySelectorAll('.study')];
const autoplayButton = document.querySelector('.autoplay');
const counter = document.querySelector('.carousel-count');
const announcement = document.querySelector('.carousel-announcement');
let slideIndex = 0;
let carouselVisible = false;
let carouselHovered = false;
let carouselFocused = false;
let userPaused = false;
let carouselTimer;
function updateAutoplayButton() {
  const paused = userPaused || reducedMotion.matches;
  autoplayButton.setAttribute('aria-pressed', String(paused));
  autoplayButton.setAttribute('aria-label', paused ? 'Iniciar carrossel automático' : 'Pausar carrossel automático');
  autoplayButton.querySelector('use').setAttribute('href', paused ? '#play' : '#pause');
}
function scheduleCarousel() {
  clearTimeout(carouselTimer);
  if (!carouselVisible || carouselHovered || carouselFocused || userPaused || document.hidden || reducedMotion.matches || slides.length < 2) return;
  carouselTimer = setTimeout(() => { showSlide(slideIndex + 1); scheduleCarousel(); }, 4200);
}
function lastStartIndex() {
  const stride = slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : carousel.clientWidth;
  return Math.max(0, Math.ceil((carousel.scrollWidth - carousel.clientWidth) / Math.max(1, stride)));
}
function showSlide(index, manual = false) {
  const positions = lastStartIndex() + 1;
  slideIndex = (index + positions) % positions;
  carousel.scrollTo({ left: slides[slideIndex].offsetLeft - slides[0].offsetLeft, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  if (manual) {
    userPaused = true;
    updateAutoplayButton();
    scheduleCarousel();
    announcement.textContent = slides[slideIndex].getAttribute('aria-label');
  }
}
document.querySelector('.next').addEventListener('click', () => showSlide(slideIndex + 1, true));
document.querySelector('.prev').addEventListener('click', () => showSlide(slideIndex - 1, true));
autoplayButton.addEventListener('click', () => {
  userPaused = !userPaused;
  updateAutoplayButton();
  scheduleCarousel();
});
carousel.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    showSlide(slideIndex + (event.key === 'ArrowRight' ? 1 : -1), true);
  }
});
for (const eventName of ['pointerdown', 'wheel']) carousel.addEventListener(eventName, () => {
  userPaused = true;
  updateAutoplayButton();
  scheduleCarousel();
}, { passive: true });
let carouselScrollFrame = 0;
carousel.addEventListener('scroll', () => {
  if (carouselScrollFrame) return;
  carouselScrollFrame = requestAnimationFrame(() => {
    carouselScrollFrame = 0;
    const width = slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : carousel.clientWidth;
    slideIndex = Math.max(0, Math.min(lastStartIndex(), Math.round(carousel.scrollLeft / Math.max(1, width))));
    counter.textContent = `${String(slideIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  });
}, { passive: true });
carouselShell.addEventListener('mouseenter', () => { carouselHovered = true; scheduleCarousel(); });
carouselShell.addEventListener('mouseleave', () => { carouselHovered = false; scheduleCarousel(); });
carouselShell.addEventListener('focusin', () => { carouselFocused = true; scheduleCarousel(); });
carouselShell.addEventListener('focusout', event => {
  carouselFocused = carouselShell.contains(event.relatedTarget);
  scheduleCarousel();
});

// Serviços: mesma informação do conteúdo central, com navegação por teclado.
const serviceLayout = document.querySelector('.service-layout');
const serviceTabs = [...document.querySelectorAll('.service-tab')];
const servicePanels = [...document.querySelectorAll('[role="tabpanel"]')];
let activeService = 0;
let serviceVisible = false;
let serviceInteraction = false;
let serviceTimer;
function scheduleServices() {
  clearTimeout(serviceTimer);
  serviceLayout.classList.toggle('auto-paused', serviceInteraction || !serviceVisible || document.hidden || reducedMotion.matches);
  if (!serviceVisible || serviceInteraction || document.hidden || reducedMotion.matches) return;
  serviceTimer = setTimeout(() => { selectService((activeService + 1) % serviceTabs.length); }, 8000);
}
function selectService(index, focus = false) {
  activeService = index;
  serviceTabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    servicePanels[i].hidden = i !== index;
  });
  if (focus) serviceTabs[index].focus();
  if (!reducedMotion.matches && servicePanels[index].animate) servicePanels[index].animate([
    { opacity: .2, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }
  ], { duration: 450, easing: 'cubic-bezier(.2,.7,.2,1)' });
  scheduleServices();
}
serviceTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectService(index));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % serviceTabs.length;
    if (event.key === 'ArrowUp') next = (index - 1 + serviceTabs.length) % serviceTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = serviceTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectService(next, true); }
  });
});
serviceLayout.addEventListener('pointerenter', () => { serviceInteraction = true; scheduleServices(); });
serviceLayout.addEventListener('pointerleave', () => { serviceInteraction = serviceLayout.contains(document.activeElement); scheduleServices(); });
serviceLayout.addEventListener('focusin', () => { serviceInteraction = true; scheduleServices(); });
serviceLayout.addEventListener('focusout', event => { serviceInteraction = serviceLayout.contains(event.relatedTarget); scheduleServices(); });

// Todo conteúdo permanece legível sem JavaScript ou se a animação não carregar.
let revealObserver;
function setupReveals() {
  revealObserver?.disconnect();
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (entry.target.animate) entry.target.animate([
      { opacity: .15, transform: 'translateY(40px)' }, { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 850, easing: 'cubic-bezier(.2,.7,.2,1)' });
    revealObserver.unobserve(entry.target);
  }), { threshold: .1 });
  document.querySelectorAll('.section-heading, .service-layout, .about-copy, .process-steps article, .faq > div, .contact-top, .contact-bottom').forEach(element => revealObserver.observe(element));
}
if ('IntersectionObserver' in window) {
  const visibility = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.target === carouselShell) { carouselVisible = entry.isIntersecting; scheduleCarousel(); }
    if (entry.target === serviceLayout) { serviceVisible = entry.isIntersecting; scheduleServices(); }
  }), { threshold: .18 });
  visibility.observe(carouselShell);
  visibility.observe(serviceLayout);
}
const progress = document.querySelector('.reading-progress');
const heroMascot = document.querySelector('.hero-mascot');
const positioning = document.querySelector('.positioning');
let scrollFrame = 0;
const clamp = n => Math.max(0, Math.min(1, n));
function renderScroll() {
  scrollFrame = 0;
  if (reducedMotion.matches) return;
  const vh = window.innerHeight;
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - vh;
  progress.style.transform = `scaleX(${max > 0 ? clamp(y / max) : 0})`;
  if (y < vh * 1.5) heroMascot.style.setProperty('--hero-offset', `${clamp(y / vh) * (window.innerWidth < 701 ? 20 : 55)}px`);
  const rect = positioning.getBoundingClientRect();
  if (rect.top < vh && rect.bottom > 0) {
    const phase = clamp((vh - rect.top) / (vh + rect.height));
    positioning.style.setProperty('--statement-scale', 1 + phase * .35);
    positioning.style.setProperty('--statement-x', `${(phase - .5) * (window.innerWidth < 701 ? 12 : 28)}px`);
  }
}
function requestScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(renderScroll); }
window.addEventListener('scroll', requestScroll, { passive: true });
window.addEventListener('resize', requestScroll, { passive: true });
document.addEventListener('visibilitychange', () => { scheduleCarousel(); scheduleServices(); });
reducedMotion.addEventListener('change', () => {
  document.getAnimations().forEach(animation => animation.cancel());
  updateAutoplayButton();
  scheduleCarousel(); scheduleServices(); setupReveals(); requestScroll();
});
updateAutoplayButton(); setupReveals(); scheduleServices(); requestScroll();
