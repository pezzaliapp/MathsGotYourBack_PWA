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
  const ring = document.getElementById('ring');
  const dot = document.getElementById('dot');
  const speedRange = document.getElementById('speed');
  const speedVal = document.getElementById('speedVal');

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

  // Build a motion-path that matches the visual ellipse
  function setPath(){
    const rect = ring.getBoundingClientRect();
    const rx = (rect.width  / 2) - 4;
    const ry = (rect.height / 2) - 4;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const p = `M ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy}`;
    const pathCSS = `path('${p}')`;
    // main dot
    dot.style.offsetPath = pathCSS;
    restartAnimations();
    // trail dots
    ensureTrail(10, pathCSS); // 10 trail elements
  }

  // Create a glow trail using multiple dots with negative animation delays
  function ensureTrail(n, pathCSS){
    // Remove old trails
    document.querySelectorAll('.trail').forEach(el => el.remove());
    for(let i=1;i<=n;i++){
      const t = document.createElement('div');
      t.className = 'trail';
      const size = Math.max(6, 14 - i); // diminishing size
      t.style.width = size + 'px';
      t.style.height = size + 'px';
      t.style.opacity = (0.55 - i*0.04).toFixed(2);
      t.style.offsetPath = pathCSS;
      t.style.animation = `along var(--speed) linear infinite`;
      t.style.animationDelay = `-${i*0.25}s`; // staggered behind the main dot
      ring.parentElement.appendChild(t);
    }
  }

  function restartAnimations(){
    dot.style.animation = 'none';
    requestAnimationFrame(() => {
      dot.style.animation = `along var(--speed) linear infinite`;
    });
  }

  // Speed control
  function setSpeed(s){
    document.documentElement.style.setProperty('--speed', s + 's');
    speedVal.textContent = s + 's';
    localStorage.setItem('speed', s);
    restartAnimations();
    // also update trail animation (it reads CSS var)
  }
  const savedSpeed = Number(localStorage.getItem('speed') || 7);
  speedRange.value = savedSpeed;
  setSpeed(savedSpeed);
  speedRange.addEventListener('input', e => setSpeed(Number(e.target.value)));

  // Init path on load/resize
  window.addEventListener('load', setPath);
  window.addEventListener('resize', () => {
    setPath();
  });

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