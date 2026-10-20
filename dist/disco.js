'use strict';

// Mirror tiles are projected onto a sphere. Only the visible hemisphere is
// painted, so the pattern travels sideways while the hanging cord stays still.
(() => {
  const shell = document.querySelector('.disco-sphere');
  const canvas = shell?.querySelector('canvas');
  const context = canvas?.getContext('2d', {alpha: true});
  if (!context) return; // Keep the still SVG as a graceful fallback.

  const size = 320;
  const center = size / 2;
  const radius = center - 2;
  const rows = 18;
  const columns = 32;
  const latitudeStep = Math.PI / rows;
  const longitudeStep = 2 * Math.PI / columns;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let phase = 0;
  let lastTime = 0;
  let lastPaint = 0;
  let visible = true;
  let frameId = 0;

  canvas.width = size;
  canvas.height = size;

  function point(latitude, longitude) {
    return [
      center + radius * Math.cos(latitude) * Math.sin(longitude),
      center + radius * Math.sin(latitude)
    ];
  }

  function draw() {
    context.clearRect(0, 0, size, size);
    context.save();
    context.beginPath();
    context.arc(center, center, radius, 0, 2 * Math.PI);
    context.clip();
    context.fillStyle = '#241932';
    context.fillRect(0, 0, size, size);

    for (let row = 0; row < rows; row++) {
      const north = -Math.PI / 2 + row * latitudeStep;
      const south = north + latitudeStep;
      const latitude = (north + south) / 2;
      for (let column = 0; column < columns; column++) {
        const west = column * longitudeStep + phase;
        const east = west + longitudeStep;
        const longitude = (west + east) / 2;
        const front = Math.cos(longitude);
        if (front <= 0) continue;

        const x = Math.cos(latitude) * Math.sin(longitude);
        const y = Math.sin(latitude);
        const z = Math.cos(latitude) * front;
        const diffuse = Math.max(0, -.46 * x - .52 * y + .7 * z);
        const specular = Math.pow(Math.max(0, -.4 * x - .4 * y + .82 * z), 22);
        const seed = Math.sin(row * 73 + column * 19) * 43758.5453;
        const variation = seed - Math.floor(seed);
        const brightTile = variation > .95 ? 25 : variation > .87 ? 9 : 0;
        const lightness = Math.max(10, Math.min(96, 13 + diffuse * 49 + variation * 18 + brightTile + specular * 26));
        const hue = x > .5 ? 320 : x < -.45 ? 220 : 267;
        const saturation = lightness > 80 ? 17 : 27;
        const corners = [
          point(north + .003, west + .003),
          point(north + .003, east - .003),
          point(south - .003, east - .003),
          point(south - .003, west + .003)
        ];
        context.beginPath();
        context.moveTo(...corners[0]);
        for (let i = 1; i < corners.length; i++) context.lineTo(...corners[i]);
        context.closePath();
        context.fillStyle = `hsl(${hue}  ${saturation}% ${lightness}%)`;
        context.fill();
        context.strokeStyle = '#24192f';
        context.lineWidth = .8;
        context.stroke();
      }
    }

    const shine = context.createRadialGradient(center * .62, center * .52, 5, center, center, radius * 1.25);
    shine.addColorStop(0, '#e9e0ff38');
    shine.addColorStop(.43, '#c29dec0b');
    shine.addColorStop(1, '#100b28ad');
    context.fillStyle = shine;
    context.fillRect(0, 0, size, size);
    context.restore();
    shell.classList.add('is-rendered');
  }

  function tick(time) {
    frameId = 0;
    if (reducedMotion.matches || !visible || document.hidden) return;
    if (!lastTime) lastTime = time;
    const elapsed = Math.min(time - lastTime, 100);
    lastTime = time;
    phase = (phase + elapsed * .00052) % (2 * Math.PI);
    if (time - lastPaint >= 30) {
      draw();
      lastPaint = time;
    }
    frameId = requestAnimationFrame(tick);
  }

  function schedule() {
    if (frameId || reducedMotion.matches || !visible || document.hidden) return;
    lastTime = 0;
    frameId = requestAnimationFrame(tick);
  }

  draw();
  reducedMotion.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', schedule);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      schedule();
    }, {threshold: 0}).observe(canvas);
  }
  schedule();
})();
