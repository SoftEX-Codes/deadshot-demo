(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const running = new WeakMap();
  function reveal(element, delay = 0) {
    if (!element || preference.matches || !element.animate || navigator.connection?.saveData) return;
    running.get(element)?.cancel();
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(18px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 520, delay, easing: 'cubic-bezier(.22,1,.36,1)' });
    running.set(element, animation);
    active.add(animation);
    animation.finished.catch(() => {}).finally(() => active.delete(animation));
  }
  window.deadshotMotion = { reveal };
  preference.addEventListener('change', () => {
    if (preference.matches) active.forEach(animation => animation.cancel());
  });
  const targets = document.querySelectorAll('.hero-copy > *, .hero-art, .section-heading, .featured, .help-card, .about, .contact, .device-visual, .device-info, .catalogue-empty');
  if (!('IntersectionObserver' in window) || preference.matches || navigator.connection?.saveData) return;
  const observer = new IntersectionObserver(entries => {
    let order = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Never keep text hidden while waiting for JavaScript or an observer.
      reveal(entry.target, Math.min(order++ * 55, 165));
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  targets.forEach(target => observer.observe(target));
})();
