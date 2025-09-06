/* MIT © 2025 Alessandro Pezzali — MathsGotYourBack PWA (canvas trail edition) */
(() => {
  // Text
  const phrases = {
    en: { motto: "MATH'S GOT YOUR BACK.", sub: "Math is on your side." },
    it: { motto: "LA MATEMATICA TI COPRE LE SPALLE.", sub: "Math’s got your back." }
  };
  const mottoEl = document.getElementById('motto');
  const subEl = document.getElementById('subtitle');
  const toggle = document.getElementById('toggleLang');
  const shareBtn = document.getElementById('shareBtn');
  const installBtn = document.getElementById('installBtn');
  const speedRange = document.getElementById('speed');
  const speedVal = document.getElementById('speedVal');
  const trailRange = document.getElementById('trail');
  const trailVal = document.getElementById('trailVal');

  function apply(lang){
    mottoEl.textContent = phrases[lang].motto;
    subEl.textContent = phrases[lang].sub;
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }
  const savedLang = localStorage.getItem('lang') || 'it';
  apply(savedLang);
  toggle.addEventListener('click', () => {
    const lang = (document.documentElement.lang === 'en') ? 'it' : 'en';
    apply(lang);
  });

  // Canvas setup
  const canvas = document.getElementById('orb');
  const ctx = canvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;

  function resize(){
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  // Parameters
  let speed = Number(localStorage.getItem('speed') || 7); // seconds / revolution
  let trailIntensity = Number(localStorage.getItem('trailIntensity') || 7); // 1..10
  speedRange.value = speed;
  speedVal.textContent = speed + 's';
  trailRange.value = trailIntensity;
  trailVal.textContent = trailIntensity;

  speedRange.addEventListener('input', e => {
    speed = Number(e.target.value);
    speedVal.textContent = speed + 's';
    localStorage.setItem('speed', speed);
  });
  trailRange.addEventListener('input', e => {
    trailIntensity = Number(e.target.value);
    trailVal.textContent = trailIntensity;
    localStorage.setItem('trailIntensity', trailIntensity);
  });

  // Orbit params (ellipse, but invisible)
  function getOrbit(){
    const w = canvas.width, h = canvas.height;
    const cx = w/2, cy = h/2;
    const rx = Math.min(w, h) * 0.42;   // radius x
    const ry = Math.min(w, h) * 0.26;   // radius y
    const tilt = -12 * Math.PI/180;     // radians
    return {cx, cy, rx, ry, tilt};
  }

  // Draw loop with motion-blur style trail
  let t0 = performance.now();
  function draw(now){
    const dt = (now - t0) / 1000; // seconds
    t0 = now;

    const {cx, cy, rx, ry, tilt} = getOrbit();

    // trail: fade with translucent rectangle (alpha depends on trailIntensity)
    const fade = 1 - (0.06 + trailIntensity * 0.025); // more intensity -> slower fade
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0.02, fade)})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // advance angle based on speed
    const revPerSec = 1 / speed;
    // keep angle in state
    draw.theta = (draw.theta || 0) + 2*Math.PI*revPerSec*dt;
    const a = draw.theta;

    // position on ellipse with tilt
    const x = rx * Math.cos(a);
    const y = ry * Math.sin(a);
    const xt =  x * Math.cos(tilt) - y * Math.sin(tilt);
    const yt =  x * Math.sin(tilt) + y * Math.cos(tilt);
    const px = cx + xt;
    const py = cy + yt;

    // draw glow ball
    const r = Math.max(6*dpr, Math.min(canvas.width, canvas.height) * 0.012);
    ctx.save();
    ctx.shadowBlur = 24*dpr;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

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

  // Install
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