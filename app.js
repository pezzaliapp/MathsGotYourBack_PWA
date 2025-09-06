/* MIT © 2025 Alessandro Pezzali — MathsGotYourBack PWA (precession + hyper‑trail) */
(() => {
  const shareBtn = document.getElementById('shareBtn');
  const installBtn = document.getElementById('installBtn');
  const speedRange = document.getElementById('speed');
  const speedVal = document.getElementById('speedVal');
  const trailRange = document.getElementById('trail');
  const trailVal = document.getElementById('trailVal');
  const precRange = document.getElementById('prec');
  const precVal = document.getElementById('precVal');
  const hyperBtn = document.getElementById('hyperBtn');

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
  let hyper = (localStorage.getItem('hyper') || '0') === '1';
  speedRange.value = speed; speedVal.textContent = speed + 's';
  trailRange.value = trailCount; trailVal.textContent = trailCount;
  precRange.value = precDegPerRev; precVal.textContent = (precDegPerRev>=0?'+':'') + precDegPerRev + '°';
  setHyper(hyper);

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
  hyperBtn.addEventListener('click', () => setHyper(!hyper));

  function setHyper(val){
    hyper = val;
    hyperBtn.textContent = 'Hyper‑trail: ' + (hyper ? 'ON' : 'OFF');
    hyperBtn.setAttribute('aria-pressed', String(hyper));
    localStorage.setItem('hyper', hyper ? '1' : '0');
  }

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

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Advance
    const revPerSec = 1 / Math.max(0.001, speed);
    theta += 2*Math.PI*revPerSec*dt;

    // Precession coefficient
    const k = (precDegPerRev * Math.PI/180) / (2*Math.PI);

    // Trail step (angle spacing) and oversampling
    const trailSamples = Math.max(10, trailCount);
    const step = (Math.PI * 1.5) / trailSamples;
    const oversample = hyper ? 4 : 1; // sub-steps between each trail point

    // Render trail from far to near
    for (let i = trailSamples; i >= 0; i--){
      for (let sub = oversample-1; sub >= 0; sub--){
        const ang = theta - i*step - (sub/oversample)*step;
        const tilt = baseTilt + k * ang;

        const x = rx * Math.cos(ang);
        const y = ry * Math.sin(ang);
        const xt =  x * Math.cos(tilt) - y * Math.sin(tilt);
        const yt =  x * Math.sin(tilt) + y * Math.cos(tilt);
        const px = cx + xt;
        const py = cy + yt;

        // Taper based on overall distance behind head
        const t = (i + sub/oversample) / trailSamples;
        const r = Math.max(2.8*dpr, Math.min(canvas.width, canvas.height) * 0.0075) * (0.55 + 0.45*(1 - t));
        const alpha = (1 - t) ** 2 * 0.9 + 0.1;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(255,255,255,${alpha*0.07})`;
        ctx.beginPath(); ctx.arc(px, py, r*2.0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
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