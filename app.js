/* MIT © 2025 Alessandro Pezzali — MathsGotYourBack PWA (satellite + discrete trail + precession) */
(() => {
  const shareBtn = document.getElementById('shareBtn');
  const installBtn = document.getElementById('installBtn');
  const speedRange = document.getElementById('speed');
  const speedVal = document.getElementById('speedVal');
  const trailRange = document.getElementById('trail');
  const trailVal = document.getElementById('trailVal');
  const precRange = document.getElementById('prec');
  const precVal = document.getElementById('precVal');

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

  // Params (persisted)
  let speed = Number(localStorage.getItem('speed') || 7); // sec / rev
  let trailCount = Number(localStorage.getItem('trailCount') || 120);
  let precDegPerRev = Number(localStorage.getItem('precDegPerRev') || 12); // degrees per revolution
  speedRange.value = speed; speedVal.textContent = speed + 's';
  trailRange.value = trailCount; trailVal.textContent = trailCount;
  precRange.value = precDegPerRev; precVal.textContent = (precDegPerRev>=0?'+':'') + precDegPerRev + '°';

  speedRange.addEventListener('input', e => {
    speed = Number(e.target.value); speedVal.textContent = speed + 's';
    localStorage.setItem('speed', speed);
  });
  trailRange.addEventListener('input', e => {
    trailCount = Number(e.target.value); trailVal.textContent = trailCount;
    localStorage.setItem('trailCount', trailCount);
  });
  precRange.addEventListener('input', e => {
    precDegPerRev = Number(e.target.value);
    precVal.textContent = (precDegPerRev>=0?'+':'') + precDegPerRev + '°';
    localStorage.setItem('precDegPerRev', precDegPerRev);
  });

  // Orbit (radii only; tilt handled per-sample with precession)
  function getOrbit(){
    const w = canvas.width, h = canvas.height;
    const cx = w/2, cy = h/2;
    const rx = Math.min(w, h) * 0.42;
    const ry = Math.min(w, h) * 0.26;
    return {cx, cy, rx, ry};
  }

  // Draw
  let theta = 0, lastTime = performance.now();
  const baseTilt = -12 * Math.PI/180;
  function draw(now){
    const dt = (now - lastTime) / 1000; lastTime = now;

    const {cx, cy, rx, ry} = getOrbit();

    // Clear each frame
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Angle step along the trail (covers ~3/4 orbita a 120 campioni)
    const step = (Math.PI * 1.5) / Math.max(10, trailCount);

    // advance
    const revPerSec = 1 / Math.max(0.001, speed);
    theta += 2*Math.PI*revPerSec*dt;

    // Convert precession to radians per radian of orbital angle (k)
    const k = (precDegPerRev * Math.PI/180) / (2*Math.PI); // rad of tilt per rad of theta

    // Draw from far trail to head
    for (let i = trailCount; i >= 0; i--){
      const ang = theta - i*step;
      const tilt = baseTilt + k * ang; // precession here

      const x = rx * Math.cos(ang);
      const y = ry * Math.sin(ang);
      const xt =  x * Math.cos(tilt) - y * Math.sin(tilt);
      const yt =  x * Math.sin(tilt) + y * Math.cos(tilt);
      const px = cx + xt;
      const py = cy + yt;

      // Size/opacity taper
      const t = i / (trailCount || 1);
      const r = Math.max(3*dpr, Math.min(canvas.width, canvas.height) * 0.008) * (0.6 + 0.4*(1 - t));
      const alpha = (1 - t) ** 2 * 0.9 + 0.1;

      // draw
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,255,255,${alpha*0.08})`;
      ctx.beginPath(); ctx.arc(px, py, r*2.0, 0, Math.PI*2); ctx.fill();
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