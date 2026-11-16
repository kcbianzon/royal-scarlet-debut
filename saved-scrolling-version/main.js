import * as THREE from 'three';
import gsap from 'gsap';

/* =========================================================================
   1. SYNTHESIZED ROYAL HARP & WALTZ AMBIENCE (Web Audio API)
   ========================================================================= */
class RoyalAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.intervalId = null;
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

  playChimeChord(notes = [293.66, 369.99, 440.0, 587.33, 739.99]) {
    try {
      this.init();
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        const t0 = this.ctx.currentTime + idx * 0.08;
        osc.frequency.setValueAtTime(freq, t0);

        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.055, t0 + 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 2.5);
      });
    } catch (_) {}
  }

  startWaltz() {
    if (this.isPlaying) return true;
    this.init();
    this.isPlaying = true;
    const waltzChords = [
      [220.0, 261.63, 329.63, 440.0],
      [174.61, 220.0, 261.63, 349.23],
      [196.0, 246.94, 293.66, 392.0],
      [164.81, 207.65, 246.94, 329.63]
    ];
    let step = 0;
    this.playChimeChord(waltzChords[0]);
    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;
      step = (step + 1) % waltzChords.length;
      this.playChimeChord(waltzChords[step]);
    }, 3200);
    return true;
  }

  toggleAmbience() {
    if (this.isPlaying) {
      this.isPlaying = false;
      if (this.intervalId) clearInterval(this.intervalId);
      return false;
    }
    return this.startWaltz();
  }
}

const royalAudio = new RoyalAudioEngine();

/* =========================================================================
   2. FULL-SCREEN 3D ROYAL BALLROOM CORRIDOR (`#webgl-bg-canvas`)
      Walks deeper into the Grand Ballroom as you scroll (Portfolio-style Z-flight)
   ========================================================================= */
const bgCanvas = document.getElementById('webgl-bg-canvas');
const bgScene = new THREE.Scene();
bgScene.fog = new THREE.FogExp2(0x050102, 0.018);

const bgCamera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 140);
bgCamera.position.set(0, 0.2, 14);

const bgRenderer = new THREE.WebGLRenderer({
  canvas: bgCanvas,
  antialias: true,
  powerPreference: 'high-performance'
});
bgRenderer.setSize(window.innerWidth, window.innerHeight);
bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
bgRenderer.toneMapping = THREE.ACESFilmicToneMapping;
bgRenderer.toneMappingExposure = 1.1;

const texLoader = new THREE.TextureLoader();
const ballroomTex = texLoader.load('./assets/royal_ballroom_bg.jpg');
ballroomTex.colorSpace = THREE.SRGBColorSpace;

// Lighting
const ambientLight = new THREE.AmbientLight(0x520b16, 1.8);
bgScene.add(ambientLight);

const cursorLight3D = new THREE.PointLight(0xffdf91, 5.5, 32);
cursorLight3D.position.set(0, 2, 10);
bgScene.add(cursorLight3D);

// Multi-Layered 3D Ballroom Depth Portals + Far Vista Plane
// As the camera moves from Z = 14 down to Z = -32 on scroll, you walk through the palace ballroom!
const ballroomCorridorGroup = new THREE.Group();
bgScene.add(ballroomCorridorGroup);

// Far Ballroom Backdrop Plane that glides gently with the camera for infinite palace depth
const farBallroomMat = new THREE.ShaderMaterial({
  uniforms: {
    uMap: { value: ballroomTex },
    uScrollProgress: { value: 0.0 },
    uDarken: { value: 0.58 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uMap;
    uniform float uScrollProgress;
    uniform float uDarken;
    varying vec2 vUv;

    void main() {
      // Subtle zoom-in into the palace ballroom corridor as you scroll down
      float zoom = 1.0 + uScrollProgress * 0.38;
      vec2 zoomedUv = (vUv - 0.5) / zoom + 0.5;
      vec4 tex = texture2D(uMap, zoomedUv);

      // Soft vignette so foreground Baroque frames pop with high contrast
      float dist = length((vUv - 0.5) * vec2(1.1, 1.0));
      float vig = 1.0 - smoothstep(0.45, 1.05, dist) * 0.48;

      gl_FragColor = vec4(tex.rgb * uDarken * vig, 1.0);
    }
  `,
  depthWrite: false
});

const farVistaMesh = new THREE.Mesh(new THREE.PlaneGeometry(44, 25), farBallroomMat);
farVistaMesh.position.set(0, 0.2, -16);
bgScene.add(farVistaMesh);

// 3D Ballroom Portal Archways, Columns & Chandelier Lights that you physically pass through on scroll!
const goldPBR = new THREE.MeshStandardMaterial({
  color: 0xd4af37,
  metalness: 0.94,
  roughness: 0.2
});
const obsidianPBR = new THREE.MeshStandardMaterial({
  color: 0x0b0305,
  metalness: 0.35,
  roughness: 0.3
});

const chandelierHalos = [];

for (let i = 0; i < 7; i++) {
  const zPos = 8 - i * 8;
  const portalGroup = new THREE.Group();
  portalGroup.position.set(0, 0.2, zPos);

  // Glowing Chandelier Light Cluster at the top of each bay (No duplicated castle texture planes!)
  const chandelierOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffe8a3 })
  );
  chandelierOrb.position.set(0, 3.6, 0.2);
  portalGroup.add(chandelierOrb);
  chandelierHalos.push(chandelierOrb);

  ballroomCorridorGroup.add(portalGroup);
}

// 3D Gold Dust Particle System
const goldCount = 480;
const goldGeo = new THREE.BufferGeometry();
const goldPositions = new Float32Array(goldCount * 3);
const goldSpeeds = new Float32Array(goldCount);

for (let i = 0; i < goldCount; i++) {
  goldPositions[i * 3] = (Math.random() - 0.5) * 32;
  goldPositions[i * 3 + 1] = (Math.random() - 0.5) * 24;
  goldPositions[i * 3 + 2] = 16 - Math.random() * 68;
  goldSpeeds[i] = 0.008 + Math.random() * 0.016;
}
goldGeo.setAttribute('position', new THREE.BufferAttribute(goldPositions, 3));

const goldMat = new THREE.PointsMaterial({
  color: 0xf7e49e,
  size: 0.14,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending
});
const goldParticles = new THREE.Points(goldGeo, goldMat);
bgScene.add(goldParticles);

// 3D Falling Crimson Rose Petals
const petalCount = 65;
const petalsGroup = new THREE.Group();
const petalGeo = new THREE.SphereGeometry(0.2, 10, 10);
petalGeo.scale(1.25, 0.15, 0.85);

const petalMat = new THREE.MeshStandardMaterial({
  color: 0x8b0018,
  roughness: 0.4,
  metalness: 0.15,
  side: THREE.DoubleSide
});

const petalMeshes = [];
for (let i = 0; i < petalCount; i++) {
  const mesh = new THREE.Mesh(petalGeo, petalMat);
  mesh.position.set(
    (Math.random() - 0.5) * 24,
    (Math.random() - 0.5) * 20,
    16 - Math.random() * 65
  );
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  mesh.userData = {
    fallSpeed: 0.014 + Math.random() * 0.022,
    swaySpeed: 0.5 + Math.random() * 1.1,
    swayOffset: Math.random() * Math.PI * 2,
    rotSpeedX: (Math.random() - 0.5) * 0.02,
    rotSpeedZ: (Math.random() - 0.5) * 0.02
  };
  petalsGroup.add(mesh);
  petalMeshes.push(mesh);
}
bgScene.add(petalsGroup);

function triggerGoldBurst() {
  gsap.fromTo(
    goldMat,
    { size: 0.36, opacity: 1 },
    { size: 0.14, opacity: 0.85, duration: 1.5, ease: 'power2.out' }
  );
  gsap.fromTo(
    cursorLight3D,
    { intensity: 16 },
    { intensity: 5.5, duration: 1.4, ease: 'power2.out' }
  );
}

/* =========================================================================
   3. ENCHANTED ROSE CLOCHE 3D GOLDEN SPARKS OVERLAY (`#cloche-sparks-canvas`)
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
  clocheRenderer.setSize(r.width, r.height);
  clocheRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  clocheCam.aspect = r.width / Math.max(1, r.height);
  clocheCam.updateProjectionMatrix();
}

const cSparkCount = 120;
const cSparkGeo = new THREE.BufferGeometry();
const cSparkPos = new Float32Array(cSparkCount * 3);
for (let i = 0; i < cSparkCount; i++) {
  cSparkPos[i * 3] = (Math.random() - 0.5) * 8;
  cSparkPos[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
  cSparkPos[i * 3 + 2] = (Math.random() - 0.5) * 2;
}
cSparkGeo.setAttribute('position', new THREE.BufferAttribute(cSparkPos, 3));
const cSparkMat = new THREE.PointsMaterial({
  color: 0xffeba8,
  size: 0.085,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending
});
clocheScene.add(new THREE.Points(cSparkGeo, cSparkMat));

/* =========================================================================
   4. DEDICATED THREE.JS SCENE: 3D PBR DRESS CODE SWATCH ORBS (`#orbs-canvas`)
   ========================================================================= */
const orbsCanvas = document.getElementById('orbs-canvas');
const orbsScene = new THREE.Scene();
const orbsCamera = new THREE.PerspectiveCamera(42, 860 / 240, 0.1, 50);
orbsCamera.position.set(0, 0, 6.2);

const orbsRenderer = new THREE.WebGLRenderer({
  canvas: orbsCanvas,
  antialias: true,
  alpha: true
});

function resizeOrbsScene() {
  if (!orbsCanvas || !orbsCanvas.parentElement) return;
  const rect = orbsCanvas.parentElement.getBoundingClientRect();
  orbsRenderer.setSize(rect.width, 240);
  orbsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  orbsCamera.aspect = rect.width / 240;
  orbsCamera.updateProjectionMatrix();
}

orbsScene.add(new THREE.AmbientLight(0xffffff, 1.3));
const orbsKeyLight = new THREE.PointLight(0xfff0c2, 8.5, 25);
orbsKeyLight.position.set(3, 4, 5);
orbsScene.add(orbsKeyLight);

const orbsRimLight = new THREE.PointLight(0xd4af37, 5.5, 20);
orbsRimLight.position.set(-4, -3, 3);
orbsScene.add(orbsRimLight);

const sphereGeo = new THREE.SphereGeometry(1.05, 64, 64);

const crimsonOrb = new THREE.Mesh(
  sphereGeo,
  new THREE.MeshPhysicalMaterial({
    color: 0x9b001a,
    roughness: 0.22,
    metalness: 0.18,
    clearcoat: 0.65,
    clearcoatRoughness: 0.2
  })
);
crimsonOrb.position.x = -2.8;
orbsScene.add(crimsonOrb);

const goldOrb = new THREE.Mesh(sphereGeo, goldPBR);
goldOrb.position.x = 0;
orbsScene.add(goldOrb);

const blackOrb = new THREE.Mesh(
  sphereGeo,
  new THREE.MeshPhysicalMaterial({
    color: 0x090305,
    roughness: 0.72,
    metalness: 0.12,
    clearcoat: 0.3
  })
);
blackOrb.position.x = 2.8;
orbsScene.add(blackOrb);

[crimsonOrb, goldOrb, blackOrb].forEach((orb) => {
  const halo = new THREE.Mesh(new THREE.TorusGeometry(1.24, 0.025, 16, 64), goldPBR);
  halo.rotation.x = Math.PI / 3;
  orb.add(halo);
});

/* =========================================================================
   5. OPENING ENVELOPE & ZOOM-INTO-BALLROOM SEQUENCE
      ("specially when opening the invitation it should kinda zoom in the
       envelope when it opened and it shows the whole thing")
   ========================================================================= */
const envelopeGate = document.getElementById('envelope-gate');
const envelopeZoomStage = document.getElementById('envelope-zoom-stage');
const waxSealOpenBtn = document.getElementById('wax-seal-open-btn');
const popoutLetter = document.getElementById('popout-invitation-letter');
const replayEnvelopeBtn = document.getElementById('replay-envelope-btn');
const audioToggleBtn = document.getElementById('audio-toggle-btn');
const audioIcon = document.getElementById('audio-icon');
const audioLabel = document.getElementById('audio-label');

let isOpeningSequenceActive = false;
let zoomTimeoutId = null;

function zoomIntoBallroomNow() {
  if (zoomTimeoutId) clearTimeout(zoomTimeoutId);
  envelopeGate.classList.add('zooming-into-ballroom');
  triggerGoldBurst();
  royalAudio.playChimeChord([261.63, 329.63, 392.0, 523.25, 783.99]);

  // Smoothly fly the 3D Ballroom Camera forward as the envelope zooms past the screen!
  gsap.fromTo(
    bgCamera.position,
    { z: 18 },
    { z: 12, duration: 2.1, ease: 'power3.out' }
  );

  setTimeout(() => {
    envelopeGate.classList.add('gate-hidden');
    document.body.classList.remove('gate-locked');
    isOpeningSequenceActive = false;
  }, 1150);
}

waxSealOpenBtn.addEventListener('click', () => {
  if (isOpeningSequenceActive) return;
  isOpeningSequenceActive = true;

  // Start waltz music and update button UI
  royalAudio.startWaltz();
  audioIcon.textContent = '🔊';
  audioLabel.textContent = 'Music On';

  // Step 1: Pop out the carved 24k Baroque Gold & Parchment Invitation Letter
  envelopeZoomStage.classList.add('letter-popped');
  triggerGoldBurst();
  royalAudio.playChimeChord([293.66, 369.99, 440.0, 587.33, 739.99]);

  // Step 2: After a brief moment to read "Rhian Jade Bianzon • January 9, 2027", automatically zoom INTO the envelope!
  zoomTimeoutId = setTimeout(() => {
    zoomIntoBallroomNow();
  }, 1900);
});

// Clicking the popped-out letter also triggers the zoom immediately if the user clicks early
popoutLetter.addEventListener('click', () => {
  zoomIntoBallroomNow();
});

replayEnvelopeBtn.addEventListener('click', () => {
  if (zoomTimeoutId) clearTimeout(zoomTimeoutId);
  isOpeningSequenceActive = false;
  window.scrollTo({ top: 0, behavior: 'instant' });
  envelopeZoomStage.classList.remove('letter-popped');
  envelopeGate.classList.remove('zooming-into-ballroom', 'gate-hidden');
  document.body.classList.add('gate-locked');
});

audioToggleBtn.addEventListener('click', () => {
  const playing = royalAudio.toggleAmbience();
  audioIcon.textContent = playing ? '🔊' : '🔇';
  audioLabel.textContent = playing ? 'Music On' : 'Muted';
});

/* =========================================================================
   6. POPULATE SEPARATE 18S PARCHMENT PLAQUES (Pop on Scroll — No Tabs!)
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

fill18PlaqueList('list-18-roses', 'Cavalier of the Rose');
fill18PlaqueList('list-18-candles', 'Bearer of Light');
fill18PlaqueList('list-18-treasures', 'Keeper of Wisdom');
fill18PlaqueList('list-18-bills', 'Sponsor of Grace');

/* =========================================================================
   7. POP-ON-SCROLL INTERSECTION OBSERVER (Pops each section & 18s plaque!)
   ========================================================================= */
const popObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll('.pop-on-scroll').forEach((el) => {
  popObserver.observe(el);
});

/* =========================================================================
   8. LIVE COUNTDOWN TO JANUARY 9, 2027 (`2027-01-09T17:00:00+08:00`)
   ========================================================================= */
const DEBUT_TARGET_MS = new Date('2027-01-09T17:00:00+08:00').getTime();
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

// Draw Golden QR Code inside Location Frame
const qrCanvas = document.getElementById('inline-qr-canvas');
if (qrCanvas) {
  const qctx = qrCanvas.getContext('2d');
  qctx.fillStyle = '#070203';
  qctx.fillRect(0, 0, 120, 120);
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
        qctx.fillRect(9 + c * 6, 9 + r * 6, 4.8, 4.8);
      }
    }
  }
}

/* =========================================================================
   9. 3D TILT HOVER, NATIVE <dialog closedby="any"> & WAX-STAMP RSVP
   ========================================================================= */
const dialog = document.getElementById('frame-lightbox');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDesc = document.getElementById('lightbox-desc');

// Mandatory Fallback for browsers without <dialog closedby> support (`light-dismiss-a-dialog`)
if (dialog && !('closedBy' in HTMLDialogElement.prototype)) {
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

document.querySelectorAll('.tilt-element').forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * 11}deg) rotateX(${-y * 11}deg) scale(1.015)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)';
  });

  if (el.dataset.modalTitle && dialog) {
    el.addEventListener('click', () => {
      lightboxTitle.textContent = el.dataset.modalTitle;
      lightboxDesc.textContent = el.dataset.modalSubtitle || 'Rhian Jade Bianzon • January 9, 2027';
      dialog.showModal();
    });
  }
});

// Royal RSVP Wax Stamp Form
const rsvpForm = document.getElementById('rsvp-parchment-form');
const waxStampZone = document.getElementById('wax-stamp-zone');
const stampRsvpBtn = document.getElementById('stamp-rsvp-btn');

rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault();
  waxStampZone.classList.add('stamping');
  triggerGoldBurst();
  royalAudio.playChimeChord([261.63, 329.63, 392.0, 523.25, 659.25]);

  setTimeout(() => {
    stampRsvpBtn.classList.add('sealed');
    stampRsvpBtn.innerHTML = '♛<br/>RSVP SEALED<br/>01.09.2027';
    waxStampZone.classList.remove('stamping');
  }, 550);
});

/* =========================================================================
   10. SCROLL-DRIVEN 3D BALLROOM WALKTHROUGH & ANIMATION LOOP
   ========================================================================= */
const cursorLightEl = document.getElementById('cursor-light');
const mouseNorm = { x: 0, y: 0 };
const smoothMouse = { x: 0, y: 0 };
let targetCamZ = 12;
let currentCamZ = 12;
let scrollRatio = 0;

window.addEventListener('pointermove', (e) => {
  cursorLightEl.style.left = `${e.clientX}px`;
  cursorLightEl.style.top = `${e.clientY}px`;

  mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNorm.y = -((e.clientY / window.innerHeight) * 2 - 1);

  cursorLight3D.position.x = mouseNorm.x * 10;
  cursorLight3D.position.y = mouseNorm.y * 6;
});

window.addEventListener('scroll', () => {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  scrollRatio = Math.min(1, Math.max(0, window.scrollY / maxScroll));

  // Walk the 3D Camera deep through the Royal Ballroom Corridor as you scroll!
  targetCamZ = 12 - scrollRatio * 42;
  farBallroomMat.uniforms.uScrollProgress.value = scrollRatio;

  // Fallback for Scroll Progress Indicator (`scroll-progress-indicator` guide)
  if (!CSS.supports('animation-timeline', 'scroll()')) {
    const prog = document.getElementById('progress');
    if (prog) prog.style.transform = `scaleX(${scrollRatio})`;
  }
});

window.addEventListener('resize', () => {
  bgCamera.aspect = window.innerWidth / window.innerHeight;
  bgCamera.updateProjectionMatrix();
  bgRenderer.setSize(window.innerWidth, window.innerHeight);
  resizeClocheScene();
  resizeOrbsScene();
});

resizeClocheScene();
resizeOrbsScene();

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // Smoothly interpolate 3D Camera Z & Mouse-Look Parallax inside the Ballroom
  currentCamZ = THREE.MathUtils.lerp(currentCamZ, targetCamZ, 0.05);
  smoothMouse.x = THREE.MathUtils.lerp(smoothMouse.x, mouseNorm.x * 0.65, 0.05);
  smoothMouse.y = THREE.MathUtils.lerp(smoothMouse.y, mouseNorm.y * 0.35, 0.05);

  bgCamera.position.z = currentCamZ;
  bgCamera.position.x = smoothMouse.x;
  bgCamera.position.y = 0.2 + smoothMouse.y;
  bgCamera.lookAt(smoothMouse.x * 0.35, 0.2 + smoothMouse.y * 0.4, currentCamZ - 12);

  // Keep the far palace vista anchored ahead of the camera so you never hit a flat wall
  farVistaMesh.position.z = currentCamZ - 26;
  farVistaMesh.position.x = smoothMouse.x * 0.25;
  cursorLight3D.position.z = currentCamZ - 3;

  // Flicker Chandelier Halos
  chandelierHalos.forEach((orb, idx) => {
    const s = 0.9 + Math.sin(elapsed * 5 + idx) * 0.14;
    orb.scale.setScalar(s);
  });

  // Rising Gold Dust & Falling Crimson Rose Petals
  const posAttr = goldGeo.attributes.position;
  for (let i = 0; i < goldCount; i++) {
    let y = posAttr.getY(i) + goldSpeeds[i];
    if (y > 12) y = -12;
    posAttr.setY(i, y);
  }
  posAttr.needsUpdate = true;

  petalMeshes.forEach((petal) => {
    petal.position.y -= petal.userData.fallSpeed;
    petal.position.x += Math.sin(elapsed * petal.userData.swaySpeed + petal.userData.swayOffset) * 0.009;
    petal.rotation.x += petal.userData.rotSpeedX;
    petal.rotation.z += petal.userData.rotSpeedZ;
    if (petal.position.y < -10) petal.position.y = 10;
  });

  bgRenderer.render(bgScene, bgCamera);

  // Animate Enchanted Rose Cloche Floating Sparks
  const cAttr = cSparkGeo.attributes.position;
  for (let i = 0; i < cSparkCount; i++) {
    let cy = cAttr.getY(i) + 0.008;
    if (cy > 2.2) cy = -2.2;
    cAttr.setY(i, cy);
  }
  cAttr.needsUpdate = true;
  clocheRenderer.render(clocheScene, clocheCam);

  // Animate 3D PBR Material Swatch Orbs
  crimsonOrb.rotation.y = elapsed * 0.5;
  crimsonOrb.rotation.x = Math.sin(elapsed * 0.7) * 0.2;
  goldOrb.rotation.y = -elapsed * 0.6;
  goldOrb.rotation.x = Math.cos(elapsed * 0.7) * 0.2;
  blackOrb.rotation.y = elapsed * 0.45;
  blackOrb.rotation.x = Math.sin(elapsed * 0.5) * 0.2;
  orbsRenderer.render(orbsScene, orbsCamera);
}

animate();
