import * as THREE from 'three';
import gsap from 'gsap';

/* =========================================================================
   0. PRODUCTION CONSTANTS (Rhian Jade Bianzon • January 9, 2027)
   ========================================================================= */
const DEBUT_DATE_ISO = '2027-01-09T17:00:00+08:00';
const TOTAL_STATIONS = 12;
const STATION_STEP_Z = 1000;
const MAX_CORRIDOR_Z = (TOTAL_STATIONS - 1) * STATION_STEP_Z; // 11000

/* =========================================================================
   1. ROYAL ORCHESTRAL WALTZ & CHIME AUDIO ENGINE (Web Audio API)
   ========================================================================= */
class RoyalAudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicVolume = 0.6;
    this.sfxVolume = 0.8;
    this.isWaltzRunning = false;
    this.waltzTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSealChime(freqs = [293.66, 369.99, 440.0, 587.33, 739.99, 880.0]) {
    if (this.isMuted || this.sfxVolume <= 0.01) return;
    try {
      this.init();
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        const start = this.ctx.currentTime + idx * 0.075;
        osc.frequency.setValueAtTime(f, start);

        const peak = 0.052 * this.sfxVolume;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(peak, start + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 2.4);
      });
    } catch (_) {}
  }

  playHoverHint() {
    if (this.isMuted || this.sfxVolume <= 0.01) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.16);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.02 * this.sfxVolume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (_) {}
  }

  startWaltz() {
    if (this.isWaltzRunning) return;
    this.init();
    this.isWaltzRunning = true;
    const waltzProgression = [
      [220.0, 261.63, 329.63, 440.0, 523.25],
      [174.61, 220.0, 261.63, 349.23, 440.0],
      [196.0, 246.94, 293.66, 392.0, 493.88],
      [164.81, 207.65, 246.94, 329.63, 415.3]
    ];
    let bar = 0;
    const playBar = () => {
      if (!this.isWaltzRunning || this.isMuted || this.musicVolume <= 0.01) return;
      try {
        const chord = waltzProgression[bar % waltzProgression.length];
        bar++;
        chord.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = i === 0 ? 'triangle' : 'sine';
          const t0 = this.ctx.currentTime + i * 0.22;
          osc.frequency.setValueAtTime(freq, t0);
          const vol = (i === 0 ? 0.038 : 0.022) * this.musicVolume;
          gain.gain.setValueAtTime(0.0001, t0);
          gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.18);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.8);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t0);
          osc.stop(t0 + 2.9);
        });
      } catch (_) {}
    };
    playBar();
    this.waltzTimer = setInterval(playBar, 3000);
  }
}

const audio = new RoyalAudioManager();

/* =========================================================================
   2. SOFT CIRCULAR GOLD GLOW TEXTURE FOR 3D CANDLELIGHT PARTICLES
   ========================================================================= */
function createSoftGoldParticleTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, 'rgba(255, 250, 220, 1)');
  g.addColorStop(0.4, 'rgba(247, 228, 158, 0.75)');
  g.addColorStop(1, 'rgba(212, 175, 55, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const goldGlowTex = createSoftGoldParticleTexture();

/* =========================================================================
   3. SINGLE-LAYER 3D ROYAL BALLROOM VISTA (`#webgl-canvas`)
   ========================================================================= */
const bgCanvas = document.getElementById('webgl-canvas');
const bgScene = new THREE.Scene();
bgScene.background = new THREE.Color(0x050102);

const bgCamera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 100);
bgCamera.position.set(0, 0, 10);

const bgRenderer = new THREE.WebGLRenderer({
  canvas: bgCanvas,
  antialias: true,
  powerPreference: 'high-performance'
});
bgRenderer.setSize(window.innerWidth, window.innerHeight);
bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const texLoader = new THREE.TextureLoader();
const ballroomTex = texLoader.load('./assets/royal_ballroom_bg.jpg');
ballroomTex.colorSpace = THREE.SRGBColorSpace;

const singleBallroomMat = new THREE.ShaderMaterial({
  uniforms: {
    uMap: { value: ballroomTex },
    uWalkProgress: { value: 0.0 },
    uParallax: { value: new THREE.Vector2(0, 0) }
  },
  depthWrite: false,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uMap;
    uniform float uWalkProgress;
    uniform vec2 uParallax;
    varying vec2 vUv;

    void main() {
      float zoom = 1.04 + uWalkProgress * 0.28;
      vec2 centered = (vUv - 0.5) / zoom + 0.5 + uParallax * 0.022;
      centered = clamp(centered, 0.002, 0.998);

      vec4 col = texture2D(uMap, centered);
      float dist = length((vUv - 0.5) * vec2(1.15, 1.0));
      float vig = 1.0 - smoothstep(0.32, 1.04, dist) * 0.54;

      gl_FragColor = vec4(col.rgb * 0.56 * vig, 1.0);
    }
  `
});

const ballroomVistaPlane = new THREE.Mesh(new THREE.PlaneGeometry(36, 20.25), singleBallroomMat);
ballroomVistaPlane.position.set(0, 0, -4);
bgScene.add(ballroomVistaPlane);

function fitBallroomPlaneToViewport() {
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  const dist = bgCamera.position.z - ballroomVistaPlane.position.z;
  const vFovRad = THREE.MathUtils.degToRad(bgCamera.fov);
  const visibleHeight = 2 * Math.tan(vFovRad / 2) * dist;
  const visibleWidth = visibleHeight * aspect;

  const planeAspect = 16 / 9;
  let w = visibleWidth * 1.08;
  let h = w / planeAspect;
  if (h < visibleHeight * 1.08) {
    h = visibleHeight * 1.08;
    w = h * planeAspect;
  }
  ballroomVistaPlane.scale.set(w / 36, h / 20.25, 1);
}

const dustCount = 55;
const dustGeo = new THREE.BufferGeometry();
const dustPositions = new Float32Array(dustCount * 3);
const dustSpeeds = new Float32Array(dustCount);

for (let i = 0; i < dustCount; i++) {
  dustPositions[i * 3] = (Math.random() - 0.5) * 20;
  dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
  dustPositions[i * 3 + 2] = 5 - Math.random() * 9;
  dustSpeeds[i] = 0.002 + Math.random() * 0.0045;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

const dustMat = new THREE.PointsMaterial({
  map: goldGlowTex,
  size: 0.11,
  transparent: true,
  opacity: 0.36,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});
bgScene.add(new THREE.Points(dustGeo, dustMat));

// Gently Falling Crimson Velvet Rose Petals in the Ballroom Atmosphere
function createRosePetalTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(64, 114);
  ctx.bezierCurveTo(22, 96, 10, 44, 38, 18);
  ctx.bezierCurveTo(50, 7, 60, 16, 64, 24);
  ctx.bezierCurveTo(68, 16, 78, 7, 90, 18);
  ctx.bezierCurveTo(118, 44, 106, 96, 64, 114);
  ctx.closePath();

  const grad = ctx.createRadialGradient(54, 42, 6, 64, 68, 64);
  grad.addColorStop(0, '#c81432');
  grad.addColorStop(0.5, '#8e031b');
  grad.addColorStop(1, '#42000a');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 185, 195, 0.16)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const petalTex = createRosePetalTexture();
const basePetalGeo = new THREE.PlaneGeometry(0.42, 0.48, 4, 4);
const pPos = basePetalGeo.attributes.position;
for (let i = 0; i < pPos.count; i++) {
  const px = pPos.getX(i);
  const py = pPos.getY(i);
  pPos.setZ(i, Math.sin(px * 4.2) * 0.055 + (py * py) * 0.18);
}
basePetalGeo.computeVertexNormals();

const petalPalette = [0xb3122d, 0x8d061c, 0xc71a38, 0x6f0214];
const petalItems = [];
const petalCount = 46;

for (let i = 0; i < petalCount; i++) {
  const mat = new THREE.MeshBasicMaterial({
    map: petalTex,
    color: petalPalette[i % petalPalette.length],
    transparent: true,
    opacity: 0.78 + Math.random() * 0.18,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(basePetalGeo, mat);
  const s = 0.65 + Math.random() * 0.7;
  mesh.scale.set(s, s, s);
  mesh.position.set(
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 16,
    1.2 + Math.random() * 4.8
  );
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  bgScene.add(mesh);

  petalItems.push({
    mesh,
    fallSpeed: 0.012 + Math.random() * 0.015,
    swayAmp: 0.008 + Math.random() * 0.012,
    swayFreq: 0.6 + Math.random() * 0.9,
    phase: Math.random() * Math.PI * 2,
    rotSpeedX: (Math.random() - 0.5) * 0.018,
    rotSpeedY: (Math.random() - 0.5) * 0.022,
    rotSpeedZ: (Math.random() - 0.5) * 0.015
  });
}

function triggerGoldBurst() {
  gsap.fromTo(
    dustMat,
    { size: 0.24, opacity: 0.72 },
    { size: 0.11, opacity: 0.36, duration: 1.4, ease: 'power2.out' }
  );
}

/* =========================================================================
   4. ENCHANTED ROSE CLOCHE 3D SPARKS (`#cloche-sparks-canvas`)
   ========================================================================= */
const clocheCanvas = document.getElementById('cloche-sparks-canvas');
const clocheScene = new THREE.Scene();
const clocheCam = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 30);
clocheCam.position.z = 5;
const clocheRenderer = new THREE.WebGLRenderer({
  canvas: clocheCanvas,
  antialias: true,
  alpha: true
});

function resizeClocheScene() {
  if (!clocheCanvas || !clocheCanvas.parentElement) return;
  const r = clocheCanvas.parentElement.getBoundingClientRect();
  const w = Math.max(300, r.width);
  const h = Math.max(180, r.height);
  clocheRenderer.setSize(w, h);
  clocheRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  clocheCam.aspect = w / h;
  clocheCam.updateProjectionMatrix();
}

const cSparkCount = 90;
const cSparkGeo = new THREE.BufferGeometry();
const cSparkPos = new Float32Array(cSparkCount * 3);
for (let i = 0; i < cSparkCount; i++) {
  cSparkPos[i * 3] = (Math.random() - 0.5) * 7.5;
  cSparkPos[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
  cSparkPos[i * 3 + 2] = (Math.random() - 0.5) * 2;
}
cSparkGeo.setAttribute('position', new THREE.BufferAttribute(cSparkPos, 3));
const cSparkMat = new THREE.PointsMaterial({
  map: goldGlowTex,
  size: 0.18,
  transparent: true,
  opacity: 0.88,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});
clocheScene.add(new THREE.Points(cSparkGeo, cSparkMat));

/* =========================================================================
   5. DEDICATED THREE.JS SCENE: 3D PBR DRESS CODE SWATCH ORBS (`#orbs-canvas`)
   ========================================================================= */
const orbsCanvas = document.getElementById('orbs-canvas');
const orbsScene = new THREE.Scene();
const orbsCamera = new THREE.PerspectiveCamera(40, 720 / 200, 0.1, 50);
orbsCamera.position.set(0, 0, 6.2);

const orbsRenderer = new THREE.WebGLRenderer({
  canvas: orbsCanvas,
  antialias: true,
  alpha: true
});
orbsRenderer.toneMapping = THREE.ACESFilmicToneMapping;
orbsRenderer.toneMappingExposure = 1.45;

function resizeOrbsScene() {
  if (!orbsCanvas || !orbsCanvas.parentElement) return;
  const w = Math.max(260, orbsCanvas.parentElement.clientWidth - 4);
  const h = orbsCanvas.clientHeight || (window.innerWidth <= 600 ? 138 : Math.min(210, Math.max(145, Math.round(window.innerHeight * 0.24))));
  orbsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  orbsRenderer.setSize(w, h, false);
  orbsCamera.aspect = w / Math.max(1, h);

  // Ensure all 3 orbs + gold halo rings (-3.75 .. +3.75 world X) fit comfortably inside mobile & desktop aspect ratios
  const minHalfWorldW = 4.05;
  const vHalfTan = Math.tan(THREE.MathUtils.degToRad(orbsCamera.fov * 0.5));
  orbsCamera.position.z = Math.max(6.2, minHalfWorldW / (Math.max(0.5, orbsCamera.aspect) * vHalfTan));
  orbsCamera.updateProjectionMatrix();
}

orbsScene.add(new THREE.AmbientLight(0xfff5e0, 2.6));
const orbsFrontDir = new THREE.DirectionalLight(0xfff8e7, 3.8);
orbsFrontDir.position.set(2, 3, 6);
orbsScene.add(orbsFrontDir);

const orbsKeyLight = new THREE.PointLight(0xfff0c2, 18.0, 30);
orbsKeyLight.position.set(3, 4, 5);
orbsScene.add(orbsKeyLight);

const orbsRimLight = new THREE.PointLight(0xffd768, 14.0, 25);
orbsRimLight.position.set(-4, -2, 4);
orbsScene.add(orbsRimLight);

const goldPBR = new THREE.MeshStandardMaterial({
  color: 0xd4af37,
  metalness: 0.92,
  roughness: 0.2
});

const sphereGeo = new THREE.SphereGeometry(0.98, 48, 48);

const blackOrb = new THREE.Mesh(
  sphereGeo,
  new THREE.MeshPhysicalMaterial({
    color: 0x0b0a0e,
    roughness: 0.42,
    metalness: 0.22,
    clearcoat: 0.65,
    clearcoatRoughness: 0.22
  })
);
blackOrb.position.x = -2.5;
orbsScene.add(blackOrb);

const goldOrb = new THREE.Mesh(sphereGeo, goldPBR);
goldOrb.position.x = 0;
orbsScene.add(goldOrb);

const whiteOrb = new THREE.Mesh(
  sphereGeo,
  new THREE.MeshPhysicalMaterial({
    color: 0xf7f2e8,
    roughness: 0.24,
    metalness: 0.08,
    clearcoat: 0.85,
    clearcoatRoughness: 0.14
  })
);
whiteOrb.position.x = 2.5;
orbsScene.add(whiteOrb);

[blackOrb, goldOrb, whiteOrb].forEach((orb) => {
  const halo = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.025, 16, 64), goldPBR);
  halo.rotation.x = Math.PI / 3;
  orb.add(halo);
});

/* =========================================================================
   6. POPULATE SEPARATE 18S PARCHMENT PLAQUES (Stations 6–9)
   ========================================================================= */
function fill18PlaqueList(olId, roleTitle) {
  const ol = document.getElementById(olId);
  if (!ol) return;
  ol.innerHTML = '';
  for (let i = 1; i <= 18; i++) {
    const num = String(i).padStart(2, '0');
    const li = document.createElement('li');
    li.innerHTML = `<strong>${num}.</strong> <span>${roleTitle} ${num}</span>`;
    ol.appendChild(li);
  }
}

fill18PlaqueList('list-18-roses', 'Cavalier');
fill18PlaqueList('list-18-candles', 'Candle Bearer');
fill18PlaqueList('list-18-treasures', 'Treasure');
fill18PlaqueList('list-18-bills', 'Sponsor');

/* =========================================================================
   7. LIVE COUNTDOWN & GOLDEN QR CODE
   ========================================================================= */
const DEBUT_TARGET_MS = new Date(DEBUT_DATE_ISO).getTime();
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');

function updateCountdown() {
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((DEBUT_TARGET_MS - now) / 1000));
  const d = Math.floor(diffSec / 86400);
  const h = Math.floor((diffSec % 86400) / 3600);
  const m = Math.floor((diffSec % 3600) / 60);
  const s = diffSec % 60;

  if (cdDays) cdDays.textContent = String(d).padStart(2, '0');
  if (cdHours) cdHours.textContent = String(h).padStart(2, '0');
  if (cdMins) cdMins.textContent = String(m).padStart(2, '0');
  if (cdSecs) cdSecs.textContent = String(s).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

function drawGoldQrCode(canvasEl, size, cellPx, offsetPx) {
  if (!canvasEl) return;
  const qctx = canvasEl.getContext('2d');
  qctx.fillStyle = '#080203';
  qctx.fillRect(0, 0, size, size);
  qctx.fillStyle = '#d4af37';
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1]
  ];
  for (let r = 0; r < 17; r++) {
    for (let c = 0; c < 17; c++) {
      const row = pattern[r % pattern.length];
      if (row[c % row.length]) {
        qctx.fillRect(offsetPx + c * cellPx, offsetPx + r * cellPx, cellPx * 0.82, cellPx * 0.82);
      }
    }
  }
}

drawGoldQrCode(document.getElementById('inline-qr-canvas'), 96, 4.8, 7);
drawGoldQrCode(document.getElementById('qr-canvas'), 180, 8.8, 15);

/* =========================================================================
   8. OPENING ENVELOPE & ZOOM-INTO-BALLROOM SEQUENCE
   ========================================================================= */
const envelopeGate = document.getElementById('envelope-gate');
const envelopeZoomStage = document.getElementById('envelope-zoom-stage');
const waxSealOpenBtn = document.getElementById('wax-seal-open-btn');
const popoutLetter = document.getElementById('popout-invitation-letter');
const entranceHud = document.getElementById('entrance-hud');

let hasEnteredBallroom = false;
let isOpeningSequenceActive = false;
let zoomTimeoutId = null;

function zoomIntoBallroomNow() {
  if (zoomTimeoutId) clearTimeout(zoomTimeoutId);
  envelopeGate.classList.add('zooming-into-ballroom');
  triggerGoldBurst();
  audio.playSealChime([261.63, 329.63, 392.0, 523.25, 783.99]);

  setTimeout(() => {
    envelopeGate.classList.add('gate-hidden');
    document.body.classList.remove('locked-at-entrance');
    hasEnteredBallroom = true;
    isOpeningSequenceActive = false;
    resizeClocheScene();
    resizeOrbsScene();
  }, 1050);
}

waxSealOpenBtn.addEventListener('mouseenter', () => {
  audio.playHoverHint();
});

waxSealOpenBtn.addEventListener('click', () => {
  if (isOpeningSequenceActive || hasEnteredBallroom) return;
  isOpeningSequenceActive = true;

  audio.startWaltz();
  audio.playSealChime();
  triggerGoldBurst();

  if (entranceHud) entranceHud.classList.add('fade-out');
  envelopeZoomStage.classList.add('letter-popped');

  zoomTimeoutId = setTimeout(() => {
    zoomIntoBallroomNow();
  }, 1750);
});

popoutLetter.addEventListener('click', () => {
  zoomIntoBallroomNow();
});

/* =========================================================================
   9. SILKY FLUID 3D WALKTHROUGH CAMERA (Zero Jerky Snap-Back!)
   ========================================================================= */
const stationElements = Array.from(document.querySelectorAll('.spatial-station'));
const heroSplitWords = Array.from(document.querySelectorAll('.split-word'));
const chapterJumpBtns = Array.from(document.querySelectorAll('.chapter-jump-btn[data-station-index]'));
const walkAffordance = document.getElementById('walk-affordance');
const progEl = document.getElementById('progress');

let targetZ = 0;
let currentZ = 0;

// Smooth Wheel Scroll (Direct responsive travel without tight snapping!)
window.addEventListener(
  'wheel',
  (e) => {
    if (!hasEnteredBallroom) return;
    if (e.target.closest('.hud-dropdown-panel, dialog')) return;
    e.preventDefault();

    const step = THREE.MathUtils.clamp(e.deltaY * 1.45, -380, 380);
    targetZ = THREE.MathUtils.clamp(targetZ + step, 0, MAX_CORRIDOR_Z);
  },
  { passive: false }
);

// Keyboard Navigation
window.addEventListener('keydown', (e) => {
  if (!hasEnteredBallroom) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

  if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
    e.preventDefault();
    const nextIdx = Math.min(TOTAL_STATIONS - 1, Math.round(targetZ / STATION_STEP_Z) + 1);
    targetZ = nextIdx * STATION_STEP_Z;
  } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    e.preventDefault();
    const prevIdx = Math.max(0, Math.round(targetZ / STATION_STEP_Z) - 1);
    targetZ = prevIdx * STATION_STEP_Z;
  }
});

// Mobile Touch Drag + Smooth Momentum Inertia
const touchState = { lastY: 0, velocityY: 0, isDragging: false };

window.addEventListener(
  'touchstart',
  (e) => {
    if (!hasEnteredBallroom || !e.touches.length) return;
    if (e.target.closest('.hud-dropdown-panel, dialog, input, select, button')) return;
    touchState.lastY = e.touches[0].clientY;
    touchState.velocityY = 0;
    touchState.isDragging = true;
  },
  { passive: true }
);

window.addEventListener(
  'touchmove',
  (e) => {
    if (!touchState.isDragging || !hasEnteredBallroom || !e.touches.length) return;
    const curY = e.touches[0].clientY;
    const deltaY = touchState.lastY - curY;
    touchState.lastY = curY;
    touchState.velocityY = deltaY;

    targetZ = THREE.MathUtils.clamp(targetZ + deltaY * 3.4, 0, MAX_CORRIDOR_Z);
  },
  { passive: true }
);

window.addEventListener('touchend', () => {
  touchState.isDragging = false;
});

/* =========================================================================
   10. TOP-RIGHT CHAPTER MAP, VELVET CURTAIN TELEPORT & AUDIO SETTINGS
   ========================================================================= */
const mapToggleBtn = document.getElementById('map-toggle-btn');
const audioMenuBtn = document.getElementById('audio-menu-btn');
const mapPanel = document.getElementById('ballroom-map-panel');
const audioPanel = document.getElementById('audio-settings-panel');

mapToggleBtn.addEventListener('click', () => {
  const isOpen = mapPanel.classList.toggle('open');
  audioPanel.classList.remove('open');
  mapToggleBtn.setAttribute('aria-expanded', String(isOpen));
  audioMenuBtn.setAttribute('aria-expanded', 'false');
});

audioMenuBtn.addEventListener('click', () => {
  const isOpen = audioPanel.classList.toggle('open');
  mapPanel.classList.remove('open');
  audioMenuBtn.setAttribute('aria-expanded', String(isOpen));
  mapToggleBtn.setAttribute('aria-expanded', 'false');
});

document.getElementById('close-map-btn').addEventListener('click', () => {
  mapPanel.classList.remove('open');
  mapToggleBtn.setAttribute('aria-expanded', 'false');
});
document.getElementById('close-audio-btn').addEventListener('click', () => {
  audioPanel.classList.remove('open');
  audioMenuBtn.setAttribute('aria-expanded', 'false');
});

const curtainEl = document.getElementById('curtain-transition');
const leftWing = curtainEl.querySelector('.curtain-wing.left');
const rightWing = curtainEl.querySelector('.curtain-wing.right');
const curtainCrest = curtainEl.querySelector('.curtain-crest');

function teleportToStation(stationIdx) {
  mapPanel.classList.remove('open');
  mapToggleBtn.setAttribute('aria-expanded', 'false');
  const destZ = THREE.MathUtils.clamp(stationIdx * STATION_STEP_Z, 0, MAX_CORRIDOR_Z);

  curtainEl.style.display = 'block';
  gsap.set(leftWing, { xPercent: -100 });
  gsap.set(rightWing, { xPercent: 100 });
  gsap.set(curtainCrest, { opacity: 0, scale: 0.88 });

  const tl = gsap.timeline({
    onComplete: () => {
      curtainEl.style.display = 'none';
    }
  });

  tl.to([leftWing, rightWing], { xPercent: 0, duration: 0.55, ease: 'power3.inOut' }, 0);
  tl.to(curtainCrest, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' }, 0.25);
  tl.add(() => {
    targetZ = destZ;
    currentZ = destZ;
    audio.playSealChime([261.63, 329.63, 392.0, 523.25]);
  }, 0.6);
  tl.to(curtainCrest, { opacity: 0, duration: 0.2 }, 0.75);
  tl.to(leftWing, { xPercent: -100, duration: 0.75, ease: 'power3.inOut' }, 0.8);
  tl.to(rightWing, { xPercent: 100, duration: 0.75, ease: 'power3.inOut' }, 0.8);
}

chapterJumpBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const idx = parseInt(btn.dataset.stationIndex, 10);
    if (!Number.isNaN(idx)) {
      teleportToStation(idx);
    }
  });
});

document.getElementById('replay-envelope-btn').addEventListener('click', () => {
  mapPanel.classList.remove('open');
  if (zoomTimeoutId) clearTimeout(zoomTimeoutId);
  hasEnteredBallroom = false;
  isOpeningSequenceActive = false;
  targetZ = 0;
  currentZ = 0;

  document.body.classList.add('locked-at-entrance');
  if (entranceHud) entranceHud.classList.remove('fade-out');
  if (walkAffordance) walkAffordance.classList.remove('hidden-after-scroll');
  envelopeZoomStage.classList.remove('letter-popped');
  envelopeGate.classList.remove('zooming-into-ballroom', 'gate-hidden');
});

document.getElementById('music-vol-slider').addEventListener('input', (e) => {
  const v = parseFloat(e.target.value);
  audio.musicVolume = v;
  document.getElementById('music-vol-val').textContent = `${Math.round(v * 100)}%`;
});
document.getElementById('sfx-vol-slider').addEventListener('input', (e) => {
  const v = parseFloat(e.target.value);
  audio.sfxVolume = v;
  document.getElementById('sfx-vol-val').textContent = `${Math.round(v * 100)}%`;
});
document.getElementById('mute-all-btn').addEventListener('click', () => {
  audio.isMuted = !audio.isMuted;
  document.getElementById('mute-all-btn').textContent = audio.isMuted ? 'Unmute Audio' : 'Mute / Unmute All';
});

/* =========================================================================
   11. NATIVE <dialog closedby="any"> MODALS + MANDATORY FALLBACK
   ========================================================================= */
function setupLightDismissDialog(dialog) {
  if (!dialog) return;
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (isDialogContent) return;
      dialog.close();
    });
  }
}

const frameLightbox = document.getElementById('frame-lightbox');
const venueModal = document.getElementById('venue-modal');
setupLightDismissDialog(frameLightbox);
setupLightDismissDialog(venueModal);

document.getElementById('close-lightbox-btn').addEventListener('click', () => frameLightbox.close());
document.getElementById('close-venue-modal-btn').addEventListener('click', () => venueModal.close());
document.getElementById('open-venue-modal-btn').addEventListener('click', () => {
  audio.playHoverHint();
  venueModal.showModal();
});

const lightboxImg = document.getElementById('lightbox-img');
document.querySelectorAll('.inspectable-frame').forEach((frame) => {
  frame.addEventListener('click', () => {
    audio.playHoverHint();
    document.getElementById('lightbox-title').textContent = frame.dataset.modalTitle || 'Rhian Jade Bianzon';
    document.getElementById('lightbox-desc').textContent =
      frame.dataset.modalSubtitle || 'A Decade and Eight · Saturday, January 9, 2027';
    if (lightboxImg) {
      if (frame.dataset.modalImg) {
        lightboxImg.src = frame.dataset.modalImg;
        lightboxImg.style.display = 'block';
      } else {
        lightboxImg.style.display = 'none';
      }
    }
    frameLightbox.showModal();
  });
});

// Royal RSVP Wax Stamp Form
const rsvpForm = document.getElementById('rsvp-parchment-form');
const waxStampZone = document.getElementById('wax-stamp-zone');
const stampRsvpBtn = document.getElementById('stamp-rsvp-btn');

rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault();
  waxStampZone.classList.add('stamping');
  triggerGoldBurst();
  audio.playSealChime([261.63, 329.63, 392.0, 523.25, 659.25, 783.99]);

  setTimeout(() => {
    waxStampZone.classList.remove('stamping');
    stampRsvpBtn.classList.add('sealed');
    stampRsvpBtn.innerHTML = 'RSVP Sealed<br/>01.09.2027';
  }, 520);
});

/* =========================================================================
   12. MAIN 60FPS RENDER & FLUID 3D WALKTHROUGH LOOP
   ========================================================================= */
const cursorLightEl = document.getElementById('cursor-light');
const mouseNorm = { x: 0, y: 0 };
const smoothMouse = { x: 0, y: 0 };

window.addEventListener('pointermove', (e) => {
  if (cursorLightEl) {
    cursorLightEl.style.left = `${e.clientX}px`;
    cursorLightEl.style.top = `${e.clientY}px`;
  }
  mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNorm.y = -((e.clientY / window.innerHeight) * 2 - 1);
});

function handleResize() {
  bgCamera.aspect = window.innerWidth / Math.max(1, window.innerHeight);
  bgCamera.updateProjectionMatrix();
  bgRenderer.setSize(window.innerWidth, window.innerHeight);
  fitBallroomPlaneToViewport();
  resizeClocheScene();
  resizeOrbsScene();
}

window.addEventListener('resize', handleResize);
handleResize();

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // Mobile Touch Inertia Glide
  if (!touchState.isDragging && Math.abs(touchState.velocityY) > 0.2) {
    targetZ = THREE.MathUtils.clamp(targetZ + touchState.velocityY * 1.15, 0, MAX_CORRIDOR_Z);
    touchState.velocityY *= 0.94;
  }

  // Smooth inertial interpolation
  currentZ = THREE.MathUtils.lerp(currentZ, targetZ, 0.058);
  smoothMouse.x = THREE.MathUtils.lerp(smoothMouse.x, mouseNorm.x, 0.055);
  smoothMouse.y = THREE.MathUtils.lerp(smoothMouse.y, mouseNorm.y, 0.055);

  const walkProgress = THREE.MathUtils.clamp(currentZ / MAX_CORRIDOR_Z, 0, 1);
  if (progEl) progEl.style.transform = `scaleX(${walkProgress})`;

  // Fade bottom scroll hint once user begins exploring
  if (walkAffordance && hasEnteredBallroom && currentZ > 240) {
    walkAffordance.classList.add('hidden-after-scroll');
  }

  // Update Active Chapter inside top-right Ballroom Map drawer
  const activeIdx = Math.round(currentZ / STATION_STEP_Z);
  chapterJumpBtns.forEach((btn) => {
    const idx = parseInt(btn.dataset.stationIndex, 10);
    btn.classList.toggle('active-chapter', idx === activeIdx);
  });

  // Portfolio-inspired Hero Word Split when walking past Station 0 ("Rhian   Jade")
  const heroSplitProgress = THREE.MathUtils.clamp(currentZ / 650, 0, 1);
  heroSplitWords.forEach((word) => {
    const dir = parseFloat(word.dataset.dir || '0');
    const offsetVw = dir * heroSplitProgress * 12;
    word.style.transform = `translate3d(${offsetVw.toFixed(2)}vw, 0, 0)`;
  });

  // Update Single-Layer Ballroom Vista Shader
  singleBallroomMat.uniforms.uWalkProgress.value = walkProgress;
  singleBallroomMat.uniforms.uParallax.value.set(smoothMouse.x, smoothMouse.y);

  // Smooth Non-Overlapping Spatial Z-Flight across all 12 Stations
  stationElements.forEach((el, idx) => {
    const stationZ = idx * STATION_STEP_Z;
    const delta = (currentZ - stationZ) / STATION_STEP_Z;
    const absDelta = Math.abs(delta);

    if (absDelta >= 0.52) {
      el.style.opacity = '0';
      el.style.visibility = 'hidden';
      el.classList.remove('station-active');
      return;
    }

    el.style.visibility = 'visible';
    let opacity = 1;
    if (absDelta > 0.14) {
      opacity = THREE.MathUtils.clamp(1 - (absDelta - 0.14) / 0.36, 0, 1);
    }

    const zPx = delta * 540;
    const yPx = delta * -18;
    const scale = delta < 0 ? 1 + delta * 0.24 : 1 + delta * 0.16;

    el.style.opacity = opacity.toFixed(3);
    el.style.transform = `translate3d(${(smoothMouse.x * -10 * (1 - absDelta * 0.4)).toFixed(1)}px, ${yPx.toFixed(1)}px, ${zPx.toFixed(1)}px) scale(${scale.toFixed(3)})`;
    el.classList.toggle('station-active', absDelta < 0.36);
  });

  // 3D Subtle Gold Dust & Falling Crimson Rose Petals
  const dAttr = dustGeo.attributes.position;
  for (let i = 0; i < dustCount; i++) {
    let y = dAttr.getY(i) + dustSpeeds[i];
    if (y > 7) y = -7;
    dAttr.setY(i, y);
  }
  dAttr.needsUpdate = true;

  for (let i = 0; i < petalItems.length; i++) {
    const p = petalItems[i];
    p.mesh.position.y -= p.fallSpeed;
    p.mesh.position.x += Math.sin(elapsed * p.swayFreq + p.phase) * p.swayAmp;
    p.mesh.rotation.x += p.rotSpeedX;
    p.mesh.rotation.y += p.rotSpeedY;
    p.mesh.rotation.z += p.rotSpeedZ;
    if (p.mesh.position.y < -8) {
      p.mesh.position.y = 8;
      p.mesh.position.x = (Math.random() - 0.5) * 20;
    }
  }

  bgRenderer.render(bgScene, bgCamera);

  // Station 5: Cloche Sparks
  if (Math.abs(currentZ - 5 * STATION_STEP_Z) < 1100) {
    const cAttr = cSparkGeo.attributes.position;
    for (let i = 0; i < cSparkCount; i++) {
      let cy = cAttr.getY(i) + 0.009;
      if (cy > 2.1) cy = -2.1;
      cAttr.setY(i, cy);
    }
    cAttr.needsUpdate = true;
    clocheRenderer.render(clocheScene, clocheCam);
  }

  // Station 10: 3D PBR Swatch Orbs (Obsidian Black, 24k Gold & Ivory White)
  if (Math.abs(currentZ - 10 * STATION_STEP_Z) < 1100) {
    blackOrb.rotation.y = elapsed * 0.55;
    blackOrb.rotation.x = Math.sin(elapsed * 0.7) * 0.2;
    goldOrb.rotation.y = -elapsed * 0.65;
    goldOrb.rotation.x = Math.cos(elapsed * 0.7) * 0.2;
    whiteOrb.rotation.y = elapsed * 0.5;
    whiteOrb.rotation.x = Math.sin(elapsed * 0.5) * 0.2;
    orbsRenderer.render(orbsScene, orbsCamera);
  }
}

animate();
