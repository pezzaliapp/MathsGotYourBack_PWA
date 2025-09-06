/* MIT © 2025 Alessandro Pezzali — MathsGotYourBack PWA (canvas trail v2) */
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
    // Clear to black immediately
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  // Params
  let speed = Number(localStorage.getItem('speed') || 7); // seconds / revolution
  let trailIntensity = Number(localStorage.getItem('trailIntensity') || 9); // 1..10
  speedRange.value = speed; speedVal.textContent = speed + 's';
  trailRange.value = trailIntensity; trailVal.textContent = trailIntensity;

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

  // Orbit (invisible, only positions)
  function getOrbit(){
    const w = canvas.width, h = canvas.height;
    const cx = w/2, cy = h/2;
    const rx = Math.min(w, h) * 0.42;
    const ry = Math.min(w, h) * 0.26;
    const tilt = -12 * Math.PI/180;
    return {cx, cy, rx, ry, tilt};
  }

  // Strong trail rendering
  let theta = 0, lastTime = performance.now();
  function draw(now){
    const dt = (now - lastTime) / 1000; lastTime = now;

    const {cx, cy, rx, ry, tilt} = getOrbit();

    // Trail persistence: map 1..10 -> alpha clear 0.18..0.02 (lower alpha = longer trail)
    const clearAlpha = 0.2 - (trailIntensity-1) * (0.18/9);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0,0,0,${clearAlpha.toFixed(3)})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Advance
    const revPerSec = 1 / Math.max(0.001, speed);
    theta += 2*Math.PI*revPerSec*dt;

    // Position
    const x = rx * Math.cos(theta);
    const y = ry * Math.sin(theta);
    const xt =  x * Math.cos(tilt) - y * Math.sin(tilt);
    const yt =  x * Math.sin(tilt) + y * Math.cos(tilt);
    const px = cx + xt;
    const py = cy + yt;

    // Draw glowing core + outer bloom using additive blending
    const baseR = Math.max(7*dpr, Math.min(canvas.width, canvas.height) * 0.014);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Outer bloom
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i=5; i<=40; i+=5){
      ctx.beginPath();
      ctx.arc(px, py, baseR + i*dpr, 0, Math.PI*2);
      ctx.fill();
    }

    // Mid glow
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(px, py, baseR*1.8, 0, Math.PI*2);
    ctx.fill();

    // Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, baseR, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();

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