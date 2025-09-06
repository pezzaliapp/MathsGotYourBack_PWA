/* MIT © 2025 Alessandro Pezzali — MathsGotYourBack PWA */
(() => {
  const phrases = {
    en: { motto: "MATH'S GOT YOUR BACK.", sub: "Math is on your side." },
    it: { motto: "LA MATEMATICA TI COPRE LE SPALLE.", sub: "La matematica è dalla tua parte." }
  };
  let current = 'en';
  const mottoEl = document.getElementById('motto');
  const subEl = document.getElementById('subtitle');
  const toggle = document.getElementById('toggleLang');
  const shareBtn = document.getElementById('shareBtn');
  const installBtn = document.getElementById('installBtn');

  function apply(lang){
    current = lang;
    mottoEl.textContent = phrases[lang].motto;
    subEl.textContent = phrases[lang].sub;
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }

  // Language init
  const saved = localStorage.getItem('lang');
  apply(saved === 'it' ? 'it' : 'en');

  toggle.addEventListener('click', () => apply(current === 'en' ? 'it' : 'en'));

  // Share
  shareBtn.addEventListener('click', async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Math's Got Your Back", text: mottoEl.textContent, url: location.href });
      } else {
        await navigator.clipboard.writeText(mottoEl.textContent + " — " + location.href);
        shareBtn.textContent = 'Copiato';
        setTimeout(() => shareBtn.textContent = 'Condividi', 1200);
      }
    } catch(e){ console.log(e); }
  });

  // PWA install
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    installBtn.hidden = true;
    deferredPrompt = null;
  });

  // SW
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
  }
})();