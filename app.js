/* MIT © 2025 Alessandro Pezzali — MathsGotYourBack PWA (satellite + discrete trail) */
(() => {
  const shareBtn = document.getElementById('shareBtn');
  const installBtn = document.getElementById('installBtn');
  const speedRange = document.getElementById('speed');
  const speedVal = document.getElementById('speedVal');
  const trailRange = document.getElementById('trail');
  const trailVal = document.getElementById('trailVal');

  // Canvas
  const canvas = document.getElementById('orb');
  const ctx = canvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;

  function resize(){
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  // Params
  let speed = Number(localStorage.getItem('speed') || 7); // seconds / revolution
  let trailCount = Number(localStorage.getItem('trailCount') || 90); // number of samples behind the satellite
  speedRange.value = speed; speedVal.textContent = speed + 's';
  trailRange.value = trailCount; trailVal.textContent = trailCount;

  speedRange.addEventListener('input', e => {
    speed = Number(e.target.value);
    speedVal.textContent = speed + 's';
    localStorage.setItem('speed', speed);
  });
  trailRange.addEventListener('input', e => {
    trailCount = Number(e.target.value);
    trailVal.textContent = trailCount;
    localStorage.setItem('trailCount', trailCount);
  });

  // Orbit (invisible)
  function getOrbit(){
    const w = canvas.width, h = canvas.height;
    const cx = w/2, cy = h/2;
    const rx = Math.min(w, h) * 0.42;
    const ry = Math.min(w, h) * 0.26;
    const tilt = -12 * Math.PI/180;
    return {cx, cy, rx, ry, tilt};
  }

  // Draw
  let theta = 0, lastTime = performance.now();
  function draw(now){
    const dt = (now - lastTime) / 1000; lastTime = now;
    const {cx, cy, rx, ry, tilt} = getOrbit();

    // Clear completely each frame (no band build-up)
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Angle step along the trail (cover roughly 3/4 of orbit by default at 90 samples)
    const step = (Math.PI * 1.5) / Math.max(10, trailCount);

    // advance
    const revPerSec = 1 / Math.max(0.001, speed);
    theta += 2*Math.PI*revPerSec*dt;

    // Draw from farthest trail to satellite (so satellite stays on top)
    for (let i = trailCount; i >= 0; i--){
      const ang = theta - i*step;
      const x = rx * Math.cos(ang);
      const y = ry * Math.sin(ang);
      const xt =  x * Math.cos(tilt) - y * Math.sin(tilt);
      const yt =  x * Math.sin(tilt) + y * Math.cos(tilt);
      const px = cx + xt;
      const py = cy + yt;

      // Size and opacity taper
      const t = i / (trailCount || 1);
      const r = Math.max(3*dpr, Math.min(canvas.width, canvas.height) * 0.008) * (0.6 + 0.4*(1 - t));
      const alpha = (1 - t) ** 2 * 0.95 + 0.05; // brighter near head

      // Draw
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      // faint outer glow
      ctx.fillStyle = `rgba(255,255,255,${alpha*0.08})`;
      ctx.beginPath(); ctx.arc(px, py, r*2.2, 0, Math.PI*2); ctx.fill();
      // core
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  // Share
  shareBtn.addEventListener('click', async () => {
    try {
      await (navigator.share
        ? navigator.share({ title: "Math’s got your back", text: "Math’s got your back", url: location.href })
        : navigator.clipboard.writeText("Math’s got your back — " + location.href));
      shareBtn.textContent = 'Copied';
      setTimeout(() => shareBtn.textContent = 'Share', 1200);
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