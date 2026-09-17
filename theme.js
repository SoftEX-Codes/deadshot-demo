(() => {
  let choice;
  try { choice = localStorage.getItem('deadshot-theme'); } catch {}
  const system = matchMedia('(prefers-color-scheme: dark)');
  const apply = mode => {
    document.documentElement.dataset.theme = mode;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'dark' ? '#131611' : '#eeeee6');
    document.querySelectorAll('[data-theme-toggle]').forEach(b => {
      b.textContent = mode === 'dark' ? 'Light mode' : 'Dark mode';
      b.setAttribute('aria-label', 'Switch to ' + (mode === 'dark' ? 'light' : 'dark') + ' mode');
      b.setAttribute('aria-pressed', String(mode === 'dark'));
    });
  };
  apply(choice === 'light' || choice === 'dark' ? choice : system.matches ? 'dark' : 'light');
  document.addEventListener('DOMContentLoaded', () => {
    apply(document.documentElement.dataset.theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => {
      choice = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('deadshot-theme', choice); } catch {}
      apply(choice);
    }));
  });
  system.addEventListener('change', () => { if (!choice) apply(system.matches ? 'dark' : 'light'); });
})();
