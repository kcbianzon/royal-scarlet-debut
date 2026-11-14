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

  playChimeChord(notes = [261.63, 329.63, 392.0, 523.25, 659.25]) {
    try {
      this.init();
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.085);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime + idx * 0.085);
        gain.gain.exponentialRampToValueAtTime(0.055, this.ctx.currentTime + idx * 0.085 + 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.085 + 2.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.085);
        osc.stop(this.ctx.currentTime + idx * 0.085 + 2.4);
      });
    } catch (_) {
      // Ignore audio errors if blocked by browser autoplay policy
    }
  }

  toggleAmbience() {
    this.init();
    if (this.isPlaying) {
      this.isPlaying = false;
      if (this.intervalId) clearInterval(this.intervalId);
      return false;
    } else {
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
  }
}

const royalAudio = new RoyalAudioEngine();

/* =========================================================================
   2. FULLSCREEN THREE.JS SCENE (3D Rose Petals, Gold Dust & Ballroom Rings)
   ========================================================================= */
const bgCanvas = document.getElementById('webgl-bg-canvas');
const bgScene = new THREE.Scene();
bgScene.fog = new THREE.FogExp2(0x070304, 0.032);

const bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 120);
bgCamera.position.set(0, 0, 14);

const bgRenderer = new THREE.WebGLRenderer({
  canvas: bgCanvas,
  antialias: true,
  alpha: true
});
bgRenderer.setSize(window.innerWidth, window.innerHeight);
bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight(0x4a040d, 1.5);
bgScene.add(ambientLight);

const cursorLight3D = new THREE.PointLight(0xd4af37, 5.0, 30);
cursorLight3D.position.set(0, 2, 10);
bgScene.add(cursorLight3D);

const crimsonBackLight = new THREE.PointLight(0xb80f28, 3.5, 42);
crimsonBackLight.position.set(0, -5, 2);
bgScene.add(crimsonBackLight);

// 3D Gold Dust Particle System
const goldCount = 460;
const goldGeo = new THREE.BufferGeometry();
const goldPositions = new Float32Array(goldCount * 3);
const goldSpeeds = new Float32Array(goldCount);

for (let i = 0; i < goldCount; i++) {
  goldPositions[i * 3] = (Math.random() - 0.5) * 36;
  goldPositions[i * 3 + 1] = (Math.random() - 0.5) * 32;
  goldPositions[i * 3 + 2] = (Math.random() - 0.5) * 45;
  goldSpeeds[i] = 0.008 + Math.random() * 0.018;
}
goldGeo.setAttribute('position', new THREE.BufferAttribute(goldPositions, 3));

const goldMat = new THREE.PointsMaterial({
  color: 0xf5e29c,
  size: 0.15,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending
});
const goldParticles = new THREE.Points(goldGeo, goldMat);
bgScene.add(goldParticles);

// 3D Falling Crimson Rose Petals
const petalCount = 60;
const petalsGroup = new THREE.Group();
const petalGeo = new THREE.SphereGeometry(0.22, 10, 10);
petalGeo.scale(1.25, 0.16, 0.85);

const petalMat = new THREE.MeshStandardMaterial({
  color: 0x8b0018,
  roughness: 0.4,
  metalness: 0.18,
  side: THREE.DoubleSide
});

const petalMeshes = [];
for (let i = 0; i < petalCount; i++) {
  const mesh = new THREE.Mesh(petalGeo, petalMat);
  mesh.position.set(
    (Math.random() - 0.5) * 28,
    (Math.random() - 0.5) * 26,
    (Math.random() - 0.5) * 30
  );
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  mesh.userData = {
    fallSpeed: 0.015 + Math.random() * 0.025,
    swaySpeed: 0.5 + Math.random() * 1.2,
    swayOffset: Math.random() * Math.PI * 2,
    rotSpeedX: (Math.random() - 0.5) * 0.02,
    rotSpeedZ: (Math.random() - 0.5) * 0.02
  };
  petalsGroup.add(mesh);
  petalMeshes.push(mesh);
}
bgScene.add(petalsGroup);

// 3D Ballroom Corridor Golden Rings
const corridorRings = new THREE.Group();
const ringGeo = new THREE.TorusGeometry(7.2, 0.032, 12, 80);
const ringMat = new THREE.MeshStandardMaterial({
  color: 0xd4af37,
  metalness: 0.94,
  roughness: 0.2
});

for (let i = 0; i < 6; i++) {
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.z = 4 - i * 8;
  corridorRings.add(ring);
}
bgScene.add(corridorRings);

function triggerGoldBurst() {
  gsap.fromTo(
    goldMat,
    { size: 0.36, opacity: 1 },
    { size: 0.15, opacity: 0.85, duration: 1.6, ease: 'power2.out' }
  );
  gsap.fromTo(
    cursorLight3D,
    { intensity: 15 },
    { intensity: 5.0, duration: 1.4, ease: 'power2.out' }
  );
}

/* =========================================================================
   3. 3D SHIMMER & EMBER OVERLAY ON THE ENCHANTED ROSE CLOCHE MASTERPIECE
   ========================================================================= */
const roseCanvas = document.getElementById('rose-dome-canvas');
const roseScene = new THREE.Scene();
const roseCamera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 50);
roseCamera.position.set(0, 0, 6);

const roseRenderer = new THREE.WebGLRenderer({
  canvas: roseCanvas,
  antialias: true,
  alpha: true
});

function resizeRoseScene() {
  if (!roseCanvas || !roseCanvas.parentElement) return;
  const rect = roseCanvas.parentElement.getBoundingClientRect();
  roseRenderer.setSize(rect.width, rect.height);
  roseRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  roseCamera.aspect = rect.width / Math.max(1, rect.height);
  roseCamera.updateProjectionMatrix();
}

const clocheSparkCount = 140;
const clocheSparkGeo = new THREE.BufferGeometry();
const clocheSparkPos = new Float32Array(clocheSparkCount * 3);
for (let i = 0; i < clocheSparkCount; i++) {
  clocheSparkPos[i * 3] = (Math.random() - 0.5) * 9;
  clocheSparkPos[i * 3 + 1] = (Math.random() - 0.5) * 5;
  clocheSparkPos[i * 3 + 2] = (Math.random() - 0.5) * 2;
}
clocheSparkGeo.setAttribute('position', new THREE.BufferAttribute(clocheSparkPos, 3));
const clocheSparkMat = new THREE.PointsMaterial({
  color: 0xffeba8,
  size: 0.09,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending
});
const clocheSparks = new THREE.Points(clocheSparkGeo, clocheSparkMat);
roseScene.add(clocheSparks);

/* =========================================================================
   4. DEDICATED THREE.JS SCENE: 3D PBR DRESS CODE SWATCH ORBS
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

const orbsAmbient = new THREE.AmbientLight(0xffffff, 1.3);
orbsScene.add(orbsAmbient);

const orbsKeyLight = new THREE.PointLight(0xfff0c2, 8.5, 25);
orbsKeyLight.position.set(3, 4, 5);
orbsScene.add(orbsKeyLight);

const orbsRimLight = new THREE.PointLight(0xd4af37, 5.5, 20);
orbsRimLight.position.set(-4, -3, 3);
orbsScene.add(orbsRimLight);

const sphereGeo = new THREE.SphereGeometry(1.05, 64, 64);
const goldPBRMat = new THREE.MeshStandardMaterial({
  color: 0xd4af37,
  metalness: 0.95,
  roughness: 0.18
});

// 1. Royal Crimson Satin Silk Orb
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

// 2. 24k Brushed Gold Orb
const goldOrb = new THREE.Mesh(sphereGeo, goldPBRMat);
goldOrb.position.x = 0;
orbsScene.add(goldOrb);

// 3. Obsidian Black Velvet Orb
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
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.24, 0.025, 16, 64),
    goldPBRMat
  );
  halo.rotation.x = Math.PI / 3;
  orb.add(halo);
});

/* =========================================================================
   5. STAGE 1 UI LOGIC: WAX SEAL ENVELOPE GATE & POP-OUT PARCHMENT CARD
   ========================================================================= */
const envelopeGate = document.getElementById('envelope-gate');
const envelopeStageBox = document.getElementById('envelope-stage-box');
const waxSealOpenBtn = document.getElementById('wax-seal-open-btn');
const enterBallroomBtn = document.getElementById('enter-ballroom-btn');
const gateStageText = document.getElementById('gate-stage-text');
const gatePromptLabel = document.getElementById('gate-prompt-label');
const replayEnvelopeBtn = document.getElementById('replay-envelope-btn');

waxSealOpenBtn.addEventListener('click', () => {
  envelopeStageBox.classList.add('is-open');
  envelopeGate.classList.add('envelope-opened');
  gateStageText.textContent = 'State 2: Pop-Out Invitation Reveal • Click Enter Ballroom Below';
  gatePromptLabel.textContent = 'Your Royal Invitation Awaits';
  triggerGoldBurst();
  royalAudio.playChimeChord([293.66, 369.99, 440.0, 587.33, 739.99]);
});

enterBallroomBtn.addEventListener('click', () => {
  envelopeGate.classList.add('gate-hidden');
  document.body.classList.remove('gate-locked');
  triggerGoldBurst();
  royalAudio.playChimeChord([261.63, 329.63, 392.0, 523.25, 783.99]);

  gsap.fromTo(
    bgCamera.position,
    { z: 18 },
    { z: 12, duration: 2.2, ease: 'power3.out' }
  );
});

replayEnvelopeBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  envelopeStageBox.classList.remove('is-open');
  envelopeGate.classList.remove('envelope-opened', 'gate-hidden');
  document.body.classList.add('gate-locked');
  gateStageText.textContent = 'State 1: Closed Royal Envelope • Click the Embossed Gold Rose Wax Seal';
  gatePromptLabel.textContent = 'Click the Gold Rose Wax Seal on the Envelope';
});

// Audio Toggle Button
const audioToggleBtn = document.getElementById('audio-toggle-btn');
const audioIcon = document.getElementById('audio-icon');
const audioLabel = document.getElementById('audio-label');

audioToggleBtn.addEventListener('click', () => {
  const playing = royalAudio.toggleAmbience();
  audioIcon.textContent = playing ? '🔊' : '🔇';
  audioLabel.textContent = playing ? 'Waltz On' : 'Sound Off';
});

/* =========================================================================
   6. BLANK 18TH PROGRAM PLAQUES GENERATOR & TAB MORPHING
   ========================================================================= */
const scrollLeftTitle = document.getElementById('scroll-left-title');
const scrollRightTitle = document.getElementById('scroll-right-title');
const scrollLeftList = document.getElementById('scroll-left-list');
const scrollRightList = document.getElementById('scroll-right-list');
const clocheImg = document.querySelector('.cloche-masterpiece-img');

function populateBlank18List(ulElement, prefixLabel = '[ Name Here ]') {
  ulElement.innerHTML = '';
  for (let i = 1; i <= 18; i++) {
    const num = String(i).padStart(2, '0');
    const li = document.createElement('li');
    li.innerHTML = `<span>${num}. ${prefixLabel}</span> <span>__________</span>`;
    ulElement.appendChild(li);
  }
}

populateBlank18List(scrollLeftList, '[ Name Here ]');
populateBlank18List(scrollRightList, '[ Name Here ]');

const programConfig = {
  roses: {
    leftTitle: '18 ROSES',
    rightTitle: '18 CANDLES',
    scale: 1.0,
    filter: 'brightness(1.05) contrast(1.05)'
  },
  candles: {
    leftTitle: '18 CANDLES',
    rightTitle: '18 WISHES',
    scale: 1.06,
    filter: 'brightness(1.18) saturate(1.15)'
  },
  treasures: {
    leftTitle: '18 TREASURES',
    rightTitle: '18 GIFTS',
    scale: 1.03,
    filter: 'brightness(1.1) sepia(0.12)'
  },
  bills: {
    leftTitle: '18 BLUE BILLS',
    rightTitle: '18 TOASTS',
    scale: 1.05,
    filter: 'brightness(1.12) contrast(1.08)'
  }
};

document.querySelectorAll('.program-tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.program-tab-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const key = btn.dataset.program;
    const cfg = programConfig[key] || programConfig.roses;
    scrollLeftTitle.textContent = cfg.leftTitle;
    scrollRightTitle.textContent = cfg.rightTitle;
    populateBlank18List(scrollLeftList, '[ Name Here ]');
    populateBlank18List(scrollRightList, '[ Name Here ]');

    if (clocheImg) {
      clocheImg.style.transform = `scale(${cfg.scale})`;
      clocheImg.style.filter = cfg.filter;
    }

    gsap.fromTo(
      clocheSparkMat,
      { size: 0.22, opacity: 1 },
      { size: 0.09, opacity: 0.9, duration: 1.1, ease: 'power2.out' }
    );
    royalAudio.playChimeChord([329.63, 440.0, 554.37]);
  });
});

/* =========================================================================
   7. 3D FRAME HOVER TILT & NATIVE <dialog closedby="any"> LIGHTBOX
   ========================================================================= */
const dialog = document.getElementById('frame-lightbox');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDesc = document.getElementById('lightbox-desc');

// Mandatory Fallback for browsers without <dialog closedby> support (Modern Web Guidance)
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

function openFrameDialog(title, desc) {
  if (!dialog) return;
  lightboxTitle.textContent = title || '[ EMPTY FRAME PLACEHOLDER ]';
  lightboxDesc.textContent =
    desc || 'Carved 24k Baroque gold frame with empty smoked-mirror center ready for your portrait or video.';
  dialog.showModal();
}

document.querySelectorAll('.tilt-frame').forEach((frame) => {
  frame.addEventListener('mousemove', (e) => {
    const rect = frame.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    frame.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.015)`;
  });

  frame.addEventListener('mouseleave', () => {
    frame.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)';
  });

  // Only open inspection dialog on gallery/hero frames (not the envelope gate)
  if (!frame.classList.contains('envelope-closed-artwork')) {
    frame.addEventListener('click', () => {
      openFrameDialog(frame.dataset.frameTitle, frame.dataset.frameDesc);
    });
  }
});

const viewMapBtn = document.getElementById('view-map-btn');
if (viewMapBtn) {
  viewMapBtn.addEventListener('click', () => {
    openFrameDialog(viewMapBtn.dataset.frameTitle, viewMapBtn.dataset.frameDesc);
  });
}

/* =========================================================================
   8. SCROLL-DRIVEN ENTRY/EXIT FALLBACK (Modern Web Guidance compliant)
   ========================================================================= */
if (
  !CSS.supports('(animation-timeline: view()) and (animation-range: entry)') &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches
) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.style.opacity = String(0.2 + entry.intersectionRatio * 0.8);
      }
    },
    {
      threshold: Array.from({ length: 21 }, (_, i) => i / 20)
    }
  );

  document.querySelectorAll('.scroll-reveal-section').forEach((el) => {
    observer.observe(el);
  });
}

/* =========================================================================
   9. LIVE COUNTDOWN & INTERACTIVE 3D WAX-STAMP RSVP FINALE
   ========================================================================= */
let totalSeconds = 18 * 86400 + 8 * 3600 + 45 * 60 + 12;
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');

setInterval(() => {
  if (totalSeconds > 0) totalSeconds--;
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  cdDays.textContent = String(d).padStart(2, '0');
  cdHours.textContent = String(h).padStart(2, '0');
  cdMins.textContent = String(m).padStart(2, '0');
  cdSecs.textContent = String(s).padStart(2, '0');
}, 1000);

const waxStampZone = document.getElementById('wax-stamp-zone');
const stampRsvpBtn = document.getElementById('stamp-rsvp-btn');

stampRsvpBtn.addEventListener('click', () => {
  waxStampZone.classList.add('stamping');
  triggerGoldBurst();
  royalAudio.playChimeChord([261.63, 329.63, 392.0, 523.25, 659.25]);

  setTimeout(() => {
    stampRsvpBtn.classList.add('sealed');
    stampRsvpBtn.innerHTML = '♛<br/>RSVP SEALED<br/>&amp; CONFIRMED';
    waxStampZone.classList.remove('stamping');
  }, 550);
});

/* =========================================================================
   10. CURSOR CANDLELIGHT TORCH, SCROLL CAMERA & ANIMATION LOOP
   ========================================================================= */
const cursorLightEl = document.getElementById('cursor-light');
window.addEventListener('pointermove', (e) => {
  cursorLightEl.style.left = `${e.clientX}px`;
  cursorLightEl.style.top = `${e.clientY}px`;

  const normX = (e.clientX / window.innerWidth - 0.5) * 16;
  const normY = -(e.clientY / window.innerHeight - 0.5) * 12;
  cursorLight3D.position.x = normX;
  cursorLight3D.position.y = normY;
});

window.addEventListener('scroll', () => {
  const scrollMax = Math.max(1, document.body.scrollHeight - window.innerHeight);
  const progress = window.scrollY / scrollMax;
  bgCamera.position.z = 12 - progress * 24;
  bgCamera.rotation.z = progress * 0.12;
});

window.addEventListener('resize', () => {
  bgCamera.aspect = window.innerWidth / window.innerHeight;
  bgCamera.updateProjectionMatrix();
  bgRenderer.setSize(window.innerWidth, window.innerHeight);
  resizeRoseScene();
  resizeOrbsScene();
});

resizeRoseScene();
resizeOrbsScene();

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // 1. Background Gold Dust & Falling Crimson Rose Petals
  const posAttr = goldGeo.attributes.position;
  for (let i = 0; i < goldCount; i++) {
    let y = posAttr.getY(i) + goldSpeeds[i];
    if (y > 16) y = -16;
    posAttr.setY(i, y);
  }
  posAttr.needsUpdate = true;
  goldParticles.rotation.y = elapsed * 0.03;

  petalMeshes.forEach((petal) => {
    petal.position.y -= petal.userData.fallSpeed;
    petal.position.x += Math.sin(elapsed * petal.userData.swaySpeed + petal.userData.swayOffset) * 0.01;
    petal.rotation.x += petal.userData.rotSpeedX;
    petal.rotation.z += petal.userData.rotSpeedZ;
    if (petal.position.y < -14) {
      petal.position.y = 14;
    }
  });

  bgRenderer.render(bgScene, bgCamera);

  // 2. Enchanted Rose Cloche Floating Golden Sparks
  const cAttr = clocheSparkGeo.attributes.position;
  for (let i = 0; i < clocheSparkCount; i++) {
    let cy = cAttr.getY(i) + 0.008;
    if (cy > 2.5) cy = -2.5;
    cAttr.setY(i, cy);
  }
  cAttr.needsUpdate = true;
  roseRenderer.render(roseScene, roseCamera);

  // 3. 3D PBR Material Swatch Orbs
  crimsonOrb.rotation.y = elapsed * 0.5;
  crimsonOrb.rotation.x = Math.sin(elapsed * 0.7) * 0.2;
  goldOrb.rotation.y = -elapsed * 0.6;
  goldOrb.rotation.x = Math.cos(elapsed * 0.7) * 0.2;
  blackOrb.rotation.y = elapsed * 0.45;
  blackOrb.rotation.x = Math.sin(elapsed * 0.5) * 0.2;
  orbsRenderer.render(orbsScene, orbsCamera);
}

animate();
