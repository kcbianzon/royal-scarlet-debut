import * as THREE from 'three';
import gsap from 'gsap';

/* =========================================================================
   0. PRODUCTION CONSTANTS (Rhian Jade Bianzon • January 9, 2027)
   ========================================================================= */
const DEBUTANTE_FIRST = 'RHIAN JADE';
const DEBUTANTE_LAST = 'BIANZON';
const DEBUT_DATE_ISO = '2027-01-09T17:00:00+08:00';

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

        const peak = 0.06 * this.sfxVolume;
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
      gain.gain.exponentialRampToValueAtTime(0.024 * this.sfxVolume, now + 0.04);
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
          const vol = (i === 0 ? 0.042 : 0.025) * this.musicVolume;
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
   2. HIGH-DPI PROCEDURAL 3D TEXTURES & BAROQUE GOLD BUMP MAPS
   ========================================================================= */
function createBaroqueGoldBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  for (let i = 16; i < 512; i += 32) {
    ctx.beginPath();
    ctx.arc(i, i, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(512 - i, i, 14, 0, Math.PI * 2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function createEnvelopeInvitationTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1360;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(512, 680, 80, 512, 680, 760);
  grad.addColorStop(0, '#fcf4e3');
  grad.addColorStop(0.68, '#edd8b4');
  grad.addColorStop(1, '#c5a06d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1360);

  // Double Ornate 24k Gold Filigree Borders
  ctx.strokeStyle = '#7a5410';
  ctx.lineWidth = 14;
  ctx.strokeRect(38, 38, 948, 1284);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 60, 904, 1240);
  ctx.strokeRect(74, 74, 876, 1212);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#7a5410';
  ctx.font = 'bold 54px Cinzel, serif';
  ctx.fillText('⚜ ♛ ⚜', 512, 180);

  ctx.fillStyle = '#6e0515';
  ctx.font = 'italic 52px "Cormorant Garamond", serif';
  ctx.fillText('You are cordially invited to the debut of', 512, 300);

  ctx.fillStyle = '#8b0018';
  ctx.font = 'bold 88px Cinzel, serif';
  ctx.fillText('RHIAN JADE', 512, 455);

  ctx.fillStyle = '#5a0310';
  ctx.font = 'bold 58px Cinzel, serif';
  ctx.fillText('BIANZON', 512, 540);

  ctx.strokeStyle = '#9e741c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(220, 605);
  ctx.lineTo(804, 605);
  ctx.stroke();

  ctx.fillStyle = '#4a040d';
  ctx.font = '600 38px Cinzel, serif';
  ctx.fillText('A DECADE AND EIGHT', 512, 675);

  ctx.fillStyle = '#8b0018';
  ctx.font = 'bold 66px Cinzel, serif';
  ctx.fillText('JANUARY 9, 2027', 512, 820);

  ctx.fillStyle = '#4a040d';
  ctx.font = '600 34px Cinzel, serif';
  ctx.fillText('SATURDAY • FIVE O’CLOCK IN THE EVENING', 512, 895);

  ctx.fillStyle = '#7a5410';
  ctx.font = 'italic 44px "Cormorant Garamond", serif';
  ctx.fillText('The Grand Royal Ballroom', 512, 1020);

  ctx.fillStyle = '#8b0018';
  ctx.font = 'bold 32px Cinzel, serif';
  ctx.fillText('✦ ROYAL SCARLET, 24K GOLD & OBSIDIAN ✦', 512, 1160);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createCharTexture(char, color = '#f7e49e', fontSize = 155) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 256, 256);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = 'rgba(212, 175, 55, 0.9)';
  ctx.shadowBlur = 18;
  ctx.font = `700 ${fontSize}px "Cinzel Decorative", Cinzel, serif`;

  const grad = ctx.createLinearGradient(0, 36, 0, 220);
  grad.addColorStop(0, '#fff9df');
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, '#8a6214');
  ctx.fillStyle = grad;
  ctx.fillText(char, 128, 132);

  ctx.strokeStyle = '#3d2502';
  ctx.lineWidth = 3;
  ctx.strokeText(char, 128, 132);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createFloatingBannerTexture(title, subtitle, detail = '') {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 1400, 420);
  ctx.textAlign = 'center';

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.78)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(260, 58);
  ctx.lineTo(1140, 58);
  ctx.stroke();

  const grad = ctx.createLinearGradient(0, 85, 0, 230);
  grad.addColorStop(0, '#fff9e2');
  grad.addColorStop(0.55, '#d4af37');
  grad.addColorStop(1, '#8c6516');
  ctx.fillStyle = grad;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.98)';
  ctx.shadowBlur = 22;
  ctx.font = '700 70px "Cinzel Decorative", Cinzel, serif';
  ctx.fillText(title, 700, 172);

  ctx.fillStyle = '#faefd7';
  ctx.font = '600 34px Cinzel, serif';
  ctx.fillText(subtitle, 700, 252);

  if (detail) {
    ctx.fillStyle = '#f7e49e';
    ctx.font = 'italic 38px "Cormorant Garamond", serif';
    ctx.fillText(detail, 700, 325);
  }

  ctx.beginPath();
  ctx.moveTo(360, 365);
  ctx.lineTo(1040, 365);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSmokedMirrorCanvasTexture(romanNum, title, subtitle) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 960;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(384, 480, 40, 384, 480, 560);
  grad.addColorStop(0, '#1c060b');
  grad.addColorStop(0.65, '#0b0204');
  grad.addColorStop(1, '#040102');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 768, 960);

  // Diagonal Smoked Mirror Sheen
  const sheen = ctx.createLinearGradient(0, 0, 768, 960);
  sheen.addColorStop(0, 'rgba(255,255,255,0)');
  sheen.addColorStop(0.46, 'rgba(247,228,158,0.03)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.11)');
  sheen.addColorStop(0.54, 'rgba(247,228,158,0.02)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, 768, 960);

  // Inner Gold Filigree Trim
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, 696, 888);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 52px Cinzel, serif';
  ctx.fillText('♛', 384, 340);

  ctx.fillStyle = '#f7e49e';
  ctx.font = 'bold 64px "Cinzel Decorative", Cinzel, serif';
  ctx.fillText(romanNum, 384, 445);

  ctx.fillStyle = '#faefd7';
  ctx.font = '600 34px Cinzel, serif';
  ctx.fillText(title, 384, 535);

  ctx.fillStyle = '#d4af37';
  ctx.font = 'italic 32px "Cormorant Garamond", serif';
  ctx.fillText(subtitle, 384, 600);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createProgramScrollTexture(crest, title, subtitle, roleLabel) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1360;
  const ctx = canvas.getContext('2d');

  // Rich Aged Royal Parchment Surface
  const grad = ctx.createRadialGradient(512, 680, 60, 512, 680, 740);
  grad.addColorStop(0, '#fbf1dc');
  grad.addColorStop(0.7, '#e8d0a9');
  grad.addColorStop(1, '#c29e69');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1360);

  // Ornate Gilded Filigree Borders
  ctx.strokeStyle = '#7a5410';
  ctx.lineWidth = 12;
  ctx.strokeRect(36, 36, 952, 1288);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(54, 54, 916, 1252);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#7a5410';
  ctx.font = 'bold 42px Cinzel, serif';
  ctx.fillText(crest, 512, 130);

  ctx.fillStyle = '#8b0018';
  ctx.font = 'bold 66px "Cinzel Decorative", Cinzel, serif';
  ctx.fillText(title, 512, 212);

  ctx.fillStyle = '#4a040d';
  ctx.font = 'italic 36px "Cormorant Garamond", serif';
  ctx.fillText(subtitle, 512, 268);

  ctx.strokeStyle = 'rgba(138, 100, 21, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, 298);
  ctx.lineTo(874, 298);
  ctx.stroke();

  // Two Columns of 9 Honored Guests (18 Total)
  ctx.textAlign = 'left';
  for (let i = 0; i < 18; i++) {
    const col = i < 9 ? 0 : 1;
    const row = i % 9;
    const x = col === 0 ? 96 : 536;
    const y = 378 + row * 94;
    const num = String(i + 1).padStart(2, '0');

    ctx.fillStyle = '#8b0018';
    ctx.font = 'bold 30px Cinzel, serif';
    ctx.fillText(`${num}.`, x, y);

    ctx.fillStyle = '#2d0409';
    ctx.font = '600 30px "Cormorant Garamond", serif';
    ctx.fillText(`${roleLabel} ${num}`, x + 56, y);

    ctx.strokeStyle = 'rgba(122, 84, 16, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 14);
    ctx.lineTo(x + 380, y + 14);
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#6e0515';
  ctx.font = 'italic 32px "Cormorant Garamond", serif';
  ctx.fillText('Rhian Jade Bianzon • January 9, 2027', 512, 1265);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* =========================================================================
   3. REUSABLE 3D SCULPTED BAROQUE GOLD FRAME BUILDER (Zero Pasted PNGs!)
   Builds a real 3D Carved Gold Frame with 3D Molding, Corner Rosettes & Crown!
   ========================================================================= */
const goldBumpMap = createBaroqueGoldBumpTexture();

const baroqueGoldMat = new THREE.MeshStandardMaterial({
  color: 0xd4af37,
  metalness: 0.94,
  roughness: 0.22,
  bumpMap: goldBumpMap,
  bumpScale: 0.035
});

const antiqueGoldMat = new THREE.MeshStandardMaterial({
  color: 0x9b7219,
  metalness: 0.9,
  roughness: 0.28,
  bumpMap: goldBumpMap,
  bumpScale: 0.04
});

const crimsonVelvetMat = new THREE.MeshPhysicalMaterial({
  color: 0x7a0014,
  roughness: 0.65,
  metalness: 0.1,
  clearcoat: 0.2
});

const darkObsidianMat = new THREE.MeshStandardMaterial({
  color: 0x090204,
  roughness: 0.25,
  metalness: 0.45
});

function create3DBaroqueRectFrame(width, height, innerTexture) {
  const group = new THREE.Group();
  const barThickness = 0.22;
  const barDepth = 0.16;

  // Inner Mirror / Canvas Surface
  const innerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: innerTexture })
  );
  group.add(innerMesh);

  // Backing Velvet Plate (Prevents seeing through from angles)
  const backPlate = new THREE.Mesh(
    new THREE.BoxGeometry(width + barThickness * 1.6, height + barThickness * 1.6, 0.05),
    darkObsidianMat
  );
  backPlate.position.z = -0.04;
  group.add(backPlate);

  // Top, Bottom, Left, Right Sculpted 3D Gold Molding Bars
  const topBar = new THREE.Mesh(
    new THREE.BoxGeometry(width + barThickness * 2, barThickness, barDepth),
    baroqueGoldMat
  );
  topBar.position.set(0, height / 2 + barThickness / 2, 0.04);
  group.add(topBar);

  const botBar = topBar.clone();
  botBar.position.set(0, -height / 2 - barThickness / 2, 0.04);
  group.add(botBar);

  const leftBar = new THREE.Mesh(
    new THREE.BoxGeometry(barThickness, height + barThickness * 2, barDepth),
    baroqueGoldMat
  );
  leftBar.position.set(-width / 2 - barThickness / 2, 0, 0.04);
  group.add(leftBar);

  const rightBar = leftBar.clone();
  rightBar.position.set(width / 2 + barThickness / 2, 0, 0.04);
  group.add(rightBar);

  // Inner Bevel Gold Fillet
  const innerFilletTop = new THREE.Mesh(new THREE.BoxGeometry(width, 0.06, 0.18), antiqueGoldMat);
  innerFilletTop.position.set(0, height / 2, 0.05);
  group.add(innerFilletTop);

  const innerFilletBot = innerFilletTop.clone();
  innerFilletBot.position.set(0, -height / 2, 0.05);
  group.add(innerFilletBot);

  // 4 Sculpted Acanthus Corner Rosettes
  const corners = [
    [-width / 2 - barThickness / 2, height / 2 + barThickness / 2],
    [width / 2 + barThickness / 2, height / 2 + barThickness / 2],
    [-width / 2 - barThickness / 2, -height / 2 - barThickness / 2],
    [width / 2 + barThickness / 2, -height / 2 - barThickness / 2]
  ];
  corners.forEach(([cx, cy]) => {
    const rosette = new THREE.Mesh(new THREE.SphereGeometry(barThickness * 0.72, 16, 16), baroqueGoldMat);
    rosette.scale.set(1.1, 1.1, 0.65);
    rosette.position.set(cx, cy, 0.08);
    group.add(rosette);
  });

  // Top Center Royal Crown Crest
  const crest = new THREE.Mesh(new THREE.TorusGeometry(barThickness * 0.85, 0.055, 12, 24), baroqueGoldMat);
  crest.position.set(0, height / 2 + barThickness + 0.12, 0.06);
  group.add(crest);

  return { group, hitMesh: innerMesh };
}

function create3DBaroqueOvalMirror(radiusX, radiusY, innerTexture) {
  const group = new THREE.Group();

  // Oval Smoked Mirror Surface
  const ovalGeo = new THREE.CircleGeometry(1, 64);
  ovalGeo.scale(radiusX, radiusY, 1);
  const mirrorMesh = new THREE.Mesh(ovalGeo, new THREE.MeshBasicMaterial({ map: innerTexture }));
  group.add(mirrorMesh);

  // Outer Sculpted 3D Gold Oval Torus Ring
  const torusGeo = new THREE.TorusGeometry(1, 0.11, 24, 96);
  torusGeo.scale(radiusX, radiusY, 1);
  const goldRing = new THREE.Mesh(torusGeo, baroqueGoldMat);
  goldRing.position.z = 0.03;
  group.add(goldRing);

  // Inner Filigree Bevel Ring
  const innerTorusGeo = new THREE.TorusGeometry(0.92, 0.035, 16, 80);
  innerTorusGeo.scale(radiusX, radiusY, 1);
  const innerRing = new THREE.Mesh(innerTorusGeo, antiqueGoldMat);
  innerRing.position.z = 0.06;
  group.add(innerRing);

  // Sculpted Baroque Acanthus Flourishes around the Oval Perimeter
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const fx = Math.cos(angle) * (radiusX + 0.14);
    const fy = Math.sin(angle) * (radiusY + 0.14);
    const flourish = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), baroqueGoldMat);
    flourish.scale.set(1.2, 0.7, 0.6);
    flourish.position.set(fx, fy, 0.06);
    flourish.rotation.z = angle;
    group.add(flourish);
  }

  // Royal Crown Crest at Top of Oval
  const crownGroup = new THREE.Group();
  crownGroup.position.set(0, radiusY + 0.36, 0.08);
  const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.22, 16), baroqueGoldMat);
  crownGroup.add(crownBase);
  const crownArch = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 12, 24, Math.PI), baroqueGoldMat);
  crownArch.position.y = 0.1;
  crownGroup.add(crownArch);
  group.add(crownGroup);

  // 3D Crimson & Gold Rose Garland along the Bottom of the Oval
  for (let i = -4; i <= 4; i++) {
    const t = (i / 4) * 0.85 - Math.PI / 2;
    const rx = Math.cos(t) * radiusX * 0.95;
    const ry = Math.sin(t) * radiusY * 0.98;
    const rose = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 14, 14),
      i % 2 === 0 ? crimsonVelvetMat : baroqueGoldMat
    );
    rose.position.set(rx, ry, 0.12);
    group.add(rose);
  }

  return { group, hitMesh: mirrorMesh };
}

/* =========================================================================
   4. MAIN THREE.JS WORLD SETUP (`#webgl-canvas`)
   ========================================================================= */
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050102);
scene.fog = new THREE.FogExp2(0x050102, 0.024);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 150);
camera.position.set(0, 0.3, 28);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

// Responsive Mobile Scaling & Dynamic FOV (Prevents horizontal clipping on phones!)
let responsiveScale = 1.0;
function updateResponsiveCamera() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / Math.max(1, h);

  camera.aspect = aspect;
  // Widen FOV on portrait mobile screens so the entire 3D Envelope & Ballroom fit comfortably
  camera.fov = aspect < 0.75 ? 74 : aspect < 1.0 ? 66 : 58;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);

  responsiveScale = aspect < 0.75 ? 0.72 : aspect < 1.0 ? 0.85 : 1.0;
}

const texLoader = new THREE.TextureLoader();
const ballroomVistaTex = texLoader.load('./assets/royal_ballroom_bg.jpg');
const curtainStageTex = texLoader.load('./assets/royal_curtain_backdrop.jpg');
const envelopeTex = texLoader.load('./assets/royal_envelope_closed.jpg');
[ballroomVistaTex, curtainStageTex, envelopeTex].forEach((t) => {
  t.colorSpace = THREE.SRGBColorSpace;
});

// Create a UV-Cropped Texture of ONLY the Envelope Interior from `royal_envelope_closed.jpg`
// (Crops out the outer marble table & candles so ONLY the velvet/satin/gold-filigree envelope is mapped!)
const croppedEnvelopeTex = envelopeTex.clone();
croppedEnvelopeTex.needsUpdate = true;
croppedEnvelopeTex.repeat.set(0.63, 0.59);
croppedEnvelopeTex.offset.set(0.185, 0.205);

// Create a UV-Cropped Texture of ONLY the Embossed Gold Rose Wax Seal (`u: 0.42..0.58, v: 0.40..0.60`)
const croppedSealTex = envelopeTex.clone();
croppedSealTex.needsUpdate = true;
croppedSealTex.repeat.set(0.16, 0.20);
croppedSealTex.offset.set(0.42, 0.40);

// Global & Camera-Attached Candlelight
const ambientLight = new THREE.AmbientLight(0x520b16, 1.9);
scene.add(ambientLight);

const cameraTorch = new THREE.PointLight(0xffdf91, 6.8, 30);
camera.add(cameraTorch);
scene.add(camera);

/* =========================================================================
   5. CONTINUOUS 3D ROYAL PALACE BALLROOM ARCHITECTURE (Z = 24 to Z = -125)
   ========================================================================= */
const ballroomWorld = new THREE.Group();
scene.add(ballroomWorld);

// Deep Palace Ballroom Horizon Vista (Moves with camera so the corridor looks infinitely deep!)
const farBallroomMat = new THREE.ShaderMaterial({
  uniforms: {
    uMap: { value: ballroomVistaTex }
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
    varying vec2 vUv;
    void main() {
      vec4 tex = texture2D(uMap, vUv);
      float dist = length((vUv - 0.5) * vec2(1.1, 1.0));
      float vig = 1.0 - smoothstep(0.35, 0.95, dist) * 0.65;
      gl_FragColor = vec4(tex.rgb * 0.52 * vig, 1.0);
    }
  `,
  depthWrite: false
});
const farBallroomPlane = new THREE.Mesh(new THREE.PlaneGeometry(46, 26), farBallroomMat);
farBallroomPlane.position.set(0, 0.6, -20);
scene.add(farBallroomPlane);

// Obsidian Marble Floor & Royal Crimson Carpet Runner with 24k Gold Trim
const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(36, 170), darkObsidianMat);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.set(0, -2.2, -48);
ballroomWorld.add(floorMesh);

const carpetMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 170), crimsonVelvetMat);
carpetMesh.rotation.x = -Math.PI / 2;
carpetMesh.position.set(0, -2.18, -48);
ballroomWorld.add(carpetMesh);

[-2.75, 2.75].forEach((xPos) => {
  const trim = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 170), baroqueGoldMat);
  trim.position.set(xPos, -2.17, -48);
  ballroomWorld.add(trim);
});

// Repeated 3D Palace Bays: Gilded Archways, Corinthian Columns, Velvet Swags & 3D Crystal Chandeliers
const chandelierFlames = [];
for (let z = 16; z >= -116; z -= 12) {
  // Vaulted Gilded Archway
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(6.2, 0.075, 16, 90, Math.PI),
    baroqueGoldMat
  );
  arch.position.set(0, -2.2, z);
  ballroomWorld.add(arch);

  // Left & Right Obsidian & 24k Gold Columns
  [-5.6, 5.6].forEach((xCol) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 7.6, 20), darkObsidianMat);
    col.position.set(xCol, 1.6, z);
    ballroomWorld.add(col);

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.55, 0.75), baroqueGoldMat);
    plinth.position.set(xCol, -1.92, z);
    ballroomWorld.add(plinth);

    const capital = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.25, 0.4, 16), baroqueGoldMat);
    capital.position.set(xCol, 3.6, z);
    ballroomWorld.add(capital);
  });

  // 3D Crystal & 24k Gold Chandelier Hanging from the Vaulted Ceiling
  const chandelier = new THREE.Group();
  chandelier.position.set(0, 3.65, z - 6);
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8), baroqueGoldMat);
  chain.position.y = 0.6;
  chandelier.add(chain);

  const tier1 = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.03, 12, 36), baroqueGoldMat);
  tier1.rotation.x = Math.PI / 2;
  chandelier.add(tier1);

  const tier2 = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.025, 12, 32), baroqueGoldMat);
  tier2.rotation.x = Math.PI / 2;
  tier2.position.y = -0.28;
  chandelier.add(tier2);

  for (let c = 0; c < 6; c++) {
    const ang = (c / 6) * Math.PI * 2;
    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffe89e })
    );
    flame.scale.set(0.7, 1.5, 0.7);
    flame.position.set(Math.cos(ang) * 0.85, 0.12, Math.sin(ang) * 0.85);
    chandelier.add(flame);
    chandelierFlames.push(flame);
  }
  ballroomWorld.add(chandelier);
}

/* =========================================================================
   6. STAGE 0 (Z = 22): 3D ROYAL VELVET CURTAIN STAGE & ARTICULATED 3D ENVELOPE
      (No Card Hover! Hovering turns the 3D Wax Seal & cracks open the 3D Flap!)
   ========================================================================= */
const ENTRANCE_Z = 22;
const entranceStageGroup = new THREE.Group();
entranceStageGroup.position.set(0, 0.25, ENTRANCE_Z);
scene.add(entranceStageGroup);

// 3D Opera Stage Curtain Backdrop behind the Envelope (Parts wide open when entering!)
const stageCurtainMat = new THREE.MeshBasicMaterial({ map: curtainStageTex });
const leftStageCurtain = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 9.5), stageCurtainMat);
leftStageCurtain.position.set(-2.6, 0.2, -1.1);
entranceStageGroup.add(leftStageCurtain);

const rightStageCurtain = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 9.5), stageCurtainMat);
rightStageCurtain.position.set(2.6, 0.2, -1.1);
entranceStageGroup.add(rightStageCurtain);

// Articulated 3D Royal Envelope (Cropped pure envelope texture + 3D Flap Hinge + 3D Wax Seal)
const envelope3DGroup = new THREE.Group();
entranceStageGroup.add(envelope3DGroup);

const ENV_W = 4.3;
const ENV_H = 2.95;

// 1. Envelope Body with Cropped Luxury Velvet/Satin/Gold-Filigree Texture (ZERO outer marble/candles!)
const envBodyMesh = new THREE.Mesh(
  new THREE.BoxGeometry(ENV_W, ENV_H, 0.08),
  new THREE.MeshStandardMaterial({
    map: croppedEnvelopeTex,
    roughness: 0.38,
    metalness: 0.35
  })
);
envelope3DGroup.add(envBodyMesh);

// Sculpted 3D 24k Gold Filigree Frame around the 3D Envelope Body
const envGoldBorderTop = new THREE.Mesh(new THREE.BoxGeometry(ENV_W + 0.12, 0.09, 0.11), baroqueGoldMat);
envGoldBorderTop.position.set(0, ENV_H / 2, 0);
envelope3DGroup.add(envGoldBorderTop);

const envGoldBorderBot = envGoldBorderTop.clone();
envGoldBorderBot.position.set(0, -ENV_H / 2, 0);
envelope3DGroup.add(envGoldBorderBot);

const envGoldBorderLeft = new THREE.Mesh(new THREE.BoxGeometry(0.09, ENV_H + 0.12, 0.11), baroqueGoldMat);
envGoldBorderLeft.position.set(-ENV_W / 2, 0, 0);
envelope3DGroup.add(envGoldBorderLeft);

const envGoldBorderRight = envGoldBorderLeft.clone();
envGoldBorderRight.position.set(ENV_W / 2, 0, 0);
envelope3DGroup.add(envGoldBorderRight);

// 2. Inner Pop-Out Golden Invitation Letter (Hidden inside envelope until flap opens!)
const letterTex = createEnvelopeInvitationTexture();
const innerLetterMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(ENV_W * 0.78, ENV_H * 1.05),
  new THREE.MeshBasicMaterial({ map: letterTex, transparent: true })
);
innerLetterMesh.position.set(0, -0.05, 0.055);
innerLetterMesh.scale.setScalar(0.84);
innerLetterMesh.visible = false;
envelope3DGroup.add(innerLetterMesh);

// 3. Articulated 3D Top Flap (Hinged at top edge Y = +ENV_H / 2 so it physically cracks open on hover!)
const topFlapPivot = new THREE.Group();
topFlapPivot.position.set(0, ENV_H / 2, 0.05);
envelope3DGroup.add(topFlapPivot);

const flapShape = new THREE.Shape();
flapShape.moveTo(-ENV_W / 2, 0);
flapShape.lineTo(ENV_W / 2, 0);
flapShape.lineTo(0, -ENV_H * 0.54);
flapShape.closePath();

const topFlapMesh = new THREE.Mesh(
  new THREE.ExtrudeGeometry(flapShape, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015 }),
  new THREE.MeshStandardMaterial({ color: 0x0c0204, roughness: 0.5, metalness: 0.3 })
);
topFlapPivot.add(topFlapMesh);

// 4. Sculpted 3D Embossed 24k Gold Rose Wax Seal (Turns & glows on hover, pops off on click!)
const waxSealGroup = new THREE.Group();
waxSealGroup.position.set(0, -0.04, 0.11);
envelope3DGroup.add(waxSealGroup);

const waxRimMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.55, 0.07, 48), baroqueGoldMat);
waxRimMesh.rotation.x = Math.PI / 2;
waxSealGroup.add(waxRimMesh);

const waxFaceMesh = new THREE.Mesh(
  new THREE.CircleGeometry(0.49, 48),
  new THREE.MeshStandardMaterial({
    map: croppedSealTex,
    metalness: 0.78,
    roughness: 0.25
  })
);
waxFaceMesh.position.z = 0.038;
waxSealGroup.add(waxFaceMesh);

const waxHaloRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.018, 16, 64), baroqueGoldMat);
waxHaloRing.position.z = 0.02;
waxSealGroup.add(waxHaloRing);

/* =========================================================================
   7. STATION I (Z = 6.5 & Z = 1.2): SPLIT-LETTER 3D HERO ("RHIAN JADE")
      & 3D SCULPTED BAROQUE OVAL MIRROR MONUMENT
   ========================================================================= */
const heroStationGroup = new THREE.Group();
scene.add(heroStationGroup);

const HERO_TEXT_Z = 6.5;
const splitLettersGroup = new THREE.Group();
splitLettersGroup.position.set(0, 0.85, HERO_TEXT_Z);
heroStationGroup.add(splitLettersGroup);

const heroChars = [...DEBUTANTE_FIRST];
const charCenter = (heroChars.length - 1) / 2;
const heroLetterMeshes = [];

heroChars.forEach((ch, idx) => {
  const offset = idx - charCenter;
  const baseX = offset * 0.58;
  const splitDir = offset * 0.75;
  if (ch === ' ') return;

  const tex = createCharTexture(ch, '#f7e49e', 165);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 0.78),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  mesh.position.set(baseX, 0, 0);
  mesh.userData = { baseX, splitDir, idx };
  splitLettersGroup.add(mesh);
  heroLetterMeshes.push(mesh);
});

const heroSubBannerTex = createFloatingBannerTexture(
  DEBUTANTE_LAST,
  'A DECADE AND EIGHT',
  'Saturday, January 9, 2027'
);
const heroSubBannerMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(5.6, 1.68),
  new THREE.MeshBasicMaterial({ map: heroSubBannerTex, transparent: true, depthWrite: false })
);
heroSubBannerMesh.position.set(0, -0.55, HERO_TEXT_Z);
heroStationGroup.add(heroSubBannerMesh);

// Real 3D Sculpted Baroque Oval Mirror Monument at Z = 1.2 (Zero Rectangular JPEG!)
const heroMirrorInnerTex = createSmokedMirrorCanvasTexture(
  'R J B',
  'RHIAN JADE BIANZON',
  'January 9, 2027 • A Decade and Eight'
);
const heroOvalObj = create3DBaroqueOvalMirror(1.65, 2.15, heroMirrorInnerTex);
heroOvalObj.group.position.set(0, 0.45, 1.2);
heroStationGroup.add(heroOvalObj.group);

// 3D Obsidian & Gold Pedestal supporting the Hero Oval Mirror
const heroPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.1, 0.65, 24), darkObsidianMat);
heroPedestal.position.set(0, -1.9, 1.2);
heroStationGroup.add(heroPedestal);

heroOvalObj.hitMesh.userData = {
  inspectable: true,
  alignPos: { x: 0, y: 0.45, z: 5.0 },
  lookTarget: { x: 0, y: 0.45, z: 1.2 }
};

/* =========================================================================
   8. STATION II (Z = -12): LIVE 3D COUNTDOWN TO JANUARY 9, 2027 & SANCTUARY
   ========================================================================= */
const countdownStationGroup = new THREE.Group();
countdownStationGroup.position.set(0, 0.3, -12);
scene.add(countdownStationGroup);

const cdCanvas = document.createElement('canvas');
cdCanvas.width = 1600;
cdCanvas.height = 640;
const cdCtx = cdCanvas.getContext('2d');
const cdTexture = new THREE.CanvasTexture(cdCanvas);
cdTexture.colorSpace = THREE.SRGBColorSpace;

function updateLiveCountdownTexture() {
  const now = Date.now();
  const target = new Date(DEBUT_DATE_ISO).getTime();
  const diff = Math.max(0, Math.floor((target - now) / 1000));

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  const secs = diff % 60;

  cdCtx.clearRect(0, 0, 1600, 640);
  cdCtx.textAlign = 'center';

  cdCtx.fillStyle = '#d4af37';
  cdCtx.font = '600 32px Cinzel, serif';
  cdCtx.fillText('⚜ COUNTING DOWN TO SATURDAY, JANUARY 9, 2027 ⚜', 800, 75);

  const units = [
    { val: String(days).padStart(2, '0'), label: 'DAYS', x: 260 },
    { val: String(hours).padStart(2, '0'), label: 'HOURS', x: 620 },
    { val: String(mins).padStart(2, '0'), label: 'MINUTES', x: 980 },
    { val: String(secs).padStart(2, '0'), label: 'SECONDS', x: 1340 }
  ];

  units.forEach((u, i) => {
    cdCtx.strokeStyle = 'rgba(212, 175, 55, 0.85)';
    cdCtx.lineWidth = 5;
    cdCtx.beginPath();
    cdCtx.arc(u.x, 285, 135, 0, Math.PI * 2);
    cdCtx.stroke();

    cdCtx.strokeStyle = 'rgba(139, 0, 24, 0.7)';
    cdCtx.lineWidth = 2.5;
    cdCtx.beginPath();
    cdCtx.arc(u.x, 285, 120, 0, Math.PI * 2);
    cdCtx.stroke();

    const grad = cdCtx.createLinearGradient(0, 190, 0, 350);
    grad.addColorStop(0, '#fff9df');
    grad.addColorStop(0.55, '#d4af37');
    grad.addColorStop(1, '#8c6414');
    cdCtx.fillStyle = grad;
    cdCtx.font = '700 102px Cinzel, serif';
    cdCtx.fillText(u.val, u.x, 315);

    cdCtx.fillStyle = '#faefd7';
    cdCtx.font = '600 24px Cinzel, serif';
    cdCtx.fillText(u.label, u.x, 375);

    if (i < 3) {
      cdCtx.fillStyle = '#d4af37';
      cdCtx.font = '700 68px Cinzel, serif';
      cdCtx.fillText(':', u.x + 180, 305);
    }
  });

  cdCtx.fillStyle = '#faefd7';
  cdCtx.font = 'italic 44px "Cormorant Garamond", serif';
  cdCtx.fillText('The Grand Royal Ballroom • Doors Open at 5:00 PM', 800, 525);

  cdCtx.fillStyle = '#d4af37';
  cdCtx.font = '600 26px Cinzel, serif';
  cdCtx.fillText('RHIAN JADE BIANZON • A DECADE AND EIGHT', 800, 585);

  cdTexture.needsUpdate = true;
}

updateLiveCountdownTexture();
setInterval(updateLiveCountdownTexture, 1000);

const countdownHoloMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(7.4, 2.96),
  new THREE.MeshBasicMaterial({ map: cdTexture, transparent: true, depthWrite: false })
);
countdownStationGroup.add(countdownHoloMesh);

/* =========================================================================
   9. STATION III (Z = -24 to Z = -46): 3D SCULPTED PORTRAIT ALCOVES & CINEMA
      (Real 3D Extruded Gold Molding Frames — Zero Pasted PNGs!)
   ========================================================================= */
const galleryItems = [
  { z: -24, side: 'left', roman: 'I', title: 'ROYAL PORTRAIT I', sub: 'Rhian Jade • Pre-Debut Collection' },
  { z: -30, side: 'right', roman: 'II', romanTitle: 'II', title: 'ROYAL PORTRAIT II', sub: '24k Gold Couture' },
  { z: -36, side: 'left', roman: 'III', title: 'ROYAL PORTRAIT III', sub: 'Midnight Ballroom Series' },
  { z: -42, side: 'right', roman: 'IV', title: 'ROYAL PORTRAIT IV', sub: 'Candlelight Elegance' }
];

const galleryFrameObjects = [];

galleryItems.forEach((item) => {
  const xPos = item.side === 'left' ? -3.1 : 3.1;
  const mirrorTex = createSmokedMirrorCanvasTexture(item.roman, item.title, item.sub);
  const built = create3DBaroqueRectFrame(2.2, 2.8, mirrorTex);
  built.group.position.set(xPos, 0.35, item.z);
  scene.add(built.group);

  // 3D Velvet Pedestal under each Portrait Frame so it is anchored to the ballroom floor
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 1.1, 16), darkObsidianMat);
  ped.position.set(xPos, -1.65, item.z);
  scene.add(ped);

  const dir = item.side === 'left' ? 1 : -1;
  built.hitMesh.userData = {
    inspectable: true,
    alignPos: { x: xPos + dir * 2.8, y: 0.35, z: item.z + 1.1 },
    lookTarget: { x: xPos, y: 0.35, z: item.z }
  };

  galleryFrameObjects.push({
    group: built.group,
    mesh: built.hitMesh,
    z: item.z,
    side: item.side,
    currentTilt: 0.35
  });
});

// Centerpiece 3D Sculpted Baroque Cinema Screen at Z = -48
const cinemaTex = createSmokedMirrorCanvasTexture(
  '▶',
  'RHIAN JADE — PRE-DEBUT FILM',
  'Save the Date Teaser • January 9, 2027'
);
const cinemaBuilt = create3DBaroqueRectFrame(4.8, 2.75, cinemaTex);
cinemaBuilt.group.position.set(0, 0.45, -48);
scene.add(cinemaBuilt.group);

cinemaBuilt.hitMesh.userData = {
  inspectable: true,
  alignPos: { x: 0, y: 0.45, z: -43.5 },
  lookTarget: { x: 0, y: 0.45, z: -48 }
};

/* =========================================================================
   10. STATION IV & V (Z = -56 to Z = -96):
       3D ENCHANTED ROSE CLOCHE PEDESTAL + 4 SEPARATE 3D UNFURLING SCROLLS
       THAT AUTOMATICALLY POP PER SCROLL (ZERO CLICKING NEEDED!)
   ========================================================================= */
const clocheSanctuary = new THREE.Group();
clocheSanctuary.position.set(0, -0.35, -56);
scene.add(clocheSanctuary);

// 3D Fluted Obsidian & Gold Pedestal
const clochePedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 1.6, 32), darkObsidianMat);
clochePedestal.position.y = -1.05;
clocheSanctuary.add(clochePedestal);

const clocheGoldRim = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.045, 16, 48), baroqueGoldMat);
clocheGoldRim.rotation.x = Math.PI / 2;
clocheGoldRim.position.y = -0.25;
clocheSanctuary.add(clocheGoldRim);

// 3D Crystal Bell Jar (Cloche)
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.24,
  roughness: 0.06,
  metalness: 0.1,
  clearcoat: 1.0,
  side: THREE.DoubleSide
});
const clocheCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 1.35, 40, 1, true), glassMat);
clocheCylinder.position.y = 0.42;
clocheSanctuary.add(clocheCylinder);

const clocheDomeTop = new THREE.Mesh(
  new THREE.SphereGeometry(0.82, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2),
  glassMat
);
clocheDomeTop.position.y = 1.09;
clocheSanctuary.add(clocheDomeTop);

const clocheKnob = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 20), baroqueGoldMat);
clocheKnob.position.y = 2.02;
clocheSanctuary.add(clocheKnob);

// 3D Levitating Crimson & 24k Gold Rose inside the Bell Jar
const enchantedRose3D = new THREE.Group();
enchantedRose3D.position.y = 0.55;
clocheSanctuary.add(enchantedRose3D);

const roseStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.05, 12), baroqueGoldMat);
roseStem.position.y = -0.35;
enchantedRose3D.add(roseStem);

for (let layer = 0; layer < 3; layer++) {
  const count = 5 + layer * 2;
  const r = 0.14 + layer * 0.12;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + layer * 0.5;
    const pGeo = new THREE.SphereGeometry(0.21, 14, 12);
    pGeo.scale(1.1, 1.25, 0.26);
    const pMesh = new THREE.Mesh(pGeo, crimsonVelvetMat);
    pMesh.position.set(Math.cos(a) * r, 0.18 + layer * 0.03, Math.sin(a) * r);
    pMesh.lookAt(0, 0.45, 0);
    enchantedRose3D.add(pMesh);
  }
}

// 4 SEPARATE 3D UNFURLING PARCHMENT SCROLLS ALONG THE BALLROOM CORRIDOR
// Each one pops up and unfurls automatically as you scroll to its Z position!
const separate18ScrollsData = [
  {
    z: -64,
    x: -1.15,
    crest: '⚜ I • EIGHTEEN ROSES ⚜',
    title: '18 ROSES',
    sub: 'The Gentlemen of the Royal Waltz',
    role: 'Cavalier of the Rose'
  },
  {
    z: -74,
    x: 1.15,
    crest: '⚜ II • EIGHTEEN CANDLES ⚜',
    title: '18 CANDLES',
    sub: 'The Ladies Lighting the Path',
    role: 'Bearer of Light'
  },
  {
    z: -84,
    x: -1.15,
    crest: '⚜ III • EIGHTEEN TREASURES ⚜',
    title: '18 TREASURES',
    sub: 'Tokens of Wisdom & Keepsakes',
    role: 'Keeper of Wisdom'
  },
  {
    z: -94,
    x: 1.15,
    crest: '⚜ IV • EIGHTEEN BLUE BILLS ⚜',
    title: '18 BLUE BILLS',
    sub: 'Blessings of Prosperity & Grace',
    role: 'Sponsor of Grace'
  }
];

const popScrollObjects = [];

separate18ScrollsData.forEach((sc) => {
  const scrollRoot = new THREE.Group();
  scrollRoot.position.set(sc.x, 0.35, sc.z);
  scene.add(scrollRoot);

  const unfurlGroup = new THREE.Group();
  // Starts rolled-up/compact until the camera scrolls near it!
  unfurlGroup.scale.set(0.75, 0.06, 0.75);
  scrollRoot.add(unfurlGroup);

  const tex = createProgramScrollTexture(sc.crest, sc.title, sc.sub, sc.role);
  const parchmentMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 4.25),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
  );
  unfurlGroup.add(parchmentMesh);

  // Top & Bottom 3D Sculpted 24k Gold Scroll Roller Rods & Finials
  [2.15, -2.15].forEach((rodY) => {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.6, 24), baroqueGoldMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.y = rodY;
    unfurlGroup.add(rod);

    [-1.88, 1.88].forEach((finX) => {
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), baroqueGoldMat);
      finial.position.set(finX, rodY, 0);
      unfurlGroup.add(finial);
    });
  });

  const alignX = sc.x * 0.45;
  parchmentMesh.userData = {
    inspectable: true,
    alignPos: { x: sc.x, y: 0.35, z: sc.z + 3.8 },
    lookTarget: { x: sc.x, y: 0.35, z: sc.z }
  };

  popScrollObjects.push({
    root: scrollRoot,
    unfurlGroup,
    mesh: parchmentMesh,
    z: sc.z,
    baseX: sc.x,
    alignX,
    isPopped: false
  });
});

/* =========================================================================
   11. STATION VI (Z = -106): 3D DRESS CODE ORBS & ROYAL RSVP ALTAR
   ========================================================================= */
const rsvpAltarGroup = new THREE.Group();
rsvpAltarGroup.position.set(0, 0.25, -106);
scene.add(rsvpAltarGroup);

const attireBannerTex = createFloatingBannerTexture(
  'ATTIRE & ROYAL RSVP',
  'Formal Evening Attire • Royal Crimson, 24k Gold & Obsidian Black',
  'Tap the Royal RSVP Sanctuary Below to Seal Your Attendance'
);
const attireBannerMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(6.4, 1.92),
  new THREE.MeshBasicMaterial({ map: attireBannerTex, transparent: true, depthWrite: false })
);
attireBannerMesh.position.set(0, 1.85, 0);
rsvpAltarGroup.add(attireBannerMesh);

const orbGeo = new THREE.SphereGeometry(0.55, 48, 48);
const crimsonOrbMesh = new THREE.Mesh(orbGeo, crimsonVelvetMat);
crimsonOrbMesh.position.set(-1.95, 0.35, 0);
rsvpAltarGroup.add(crimsonOrbMesh);

const goldOrbMesh = new THREE.Mesh(orbGeo, baroqueGoldMat);
goldOrbMesh.position.set(0, 0.35, 0);
rsvpAltarGroup.add(goldOrbMesh);

const blackOrbMesh = new THREE.Mesh(orbGeo, darkObsidianMat);
blackOrbMesh.position.set(1.95, 0.35, 0);
rsvpAltarGroup.add(blackOrbMesh);

[crimsonOrbMesh, goldOrbMesh, blackOrbMesh].forEach((orb) => {
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.022, 16, 64), baroqueGoldMat);
  halo.rotation.x = Math.PI / 3;
  orb.add(halo);
});

// 3D Sculpted Royal RSVP Lectern on the Ballroom Floor
const rsvpLecternTex = createSmokedMirrorCanvasTexture(
  '✉️',
  'ROYAL RSVP SANCTUARY',
  'Click to Inscribe & Wax-Seal Your Attendance'
);
const rsvpLecternBuilt = create3DBaroqueRectFrame(2.5, 1.85, rsvpLecternTex);
rsvpLecternBuilt.group.position.set(0, -1.05, 1.1);
rsvpLecternBuilt.group.rotation.x = -0.32;
rsvpLecternBuilt.hitMesh.userData = { isRsvpLectern: true };
rsvpAltarGroup.add(rsvpLecternBuilt.group);

/* =========================================================================
   12. 3D FALLING CRIMSON ROSE PETALS & FLOATING GOLD EMBERS
   ========================================================================= */
const particleCount = 680;
const emberGeo = new THREE.BufferGeometry();
const emberPos = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  emberPos[i * 3] = (Math.random() - 0.5) * 26;
  emberPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
  emberPos[i * 3 + 2] = 28 - Math.random() * 145;
}
emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
const emberMat = new THREE.PointsMaterial({
  color: 0xffdf8e,
  size: 0.11,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending
});
scene.add(new THREE.Points(emberGeo, emberMat));

const petalGeo = new THREE.SphereGeometry(0.15, 10, 10);
petalGeo.scale(1.3, 0.15, 0.85);
const petals = [];
for (let i = 0; i < 80; i++) {
  const p = new THREE.Mesh(petalGeo, crimsonVelvetMat);
  p.position.set((Math.random() - 0.5) * 18, Math.random() * 8 - 2, 26 - Math.random() * 140);
  p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  p.userData = {
    speedY: 0.01 + Math.random() * 0.018,
    sway: Math.random() * Math.PI * 2,
    rotX: (Math.random() - 0.5) * 0.025,
    rotZ: (Math.random() - 0.5) * 0.025
  };
  scene.add(p);
  petals.push(p);
}

/* =========================================================================
   13. PORTFOLIO-STYLE CAMERA CONTROLLER (Desktop Wheel + Mobile Touch Inertia
       + Swipe Glance + Articulated 3D Envelope Zoom-Through!)
   ========================================================================= */
let hasEnteredBallroom = false;
let isEnvelopeAnimating = false;
let cameraOverride = false;
let targetZ = 13.5;
let currentZ = 28;
const MIN_CORRIDOR_Z = -103;
const MAX_CORRIDOR_Z = 13.5;

const mouseNorm = { x: 0, y: 0 };
const smoothParallax = { x: 0, y: 0 };
let targetSwipeGlance = 0;
let currentSwipeGlance = 0;
const savedCorridorCam = { x: 0, y: 0.3, z: 13.5 };
const lookAtProxy = new THREE.Vector3(0, 0.25, 0);

const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let isEnvelopeHovered = false;

function triggerEnvelopeZoomOpen() {
  if (hasEnteredBallroom || isEnvelopeAnimating) return;
  isEnvelopeAnimating = true;
  document.body.style.cursor = 'auto';

  audio.startWaltz();
  audio.playSealChime();

  const entranceHud = document.getElementById('entrance-hud');
  if (entranceHud) entranceHud.classList.add('fade-out');

  innerLetterMesh.visible = true;

  const tl = gsap.timeline({
    onComplete: () => {
      hasEnteredBallroom = true;
      isEnvelopeAnimating = false;
      entranceStageGroup.visible = false;
      currentZ = 13.5;
      targetZ = 13.5;
      document.body.classList.remove('locked-at-entrance');
    }
  });

  // 1. 3D Gold Rose Wax Seal Spins & Lifts Off the Flap
  tl.to(waxSealGroup.rotation, { z: Math.PI * 1.6, duration: 0.55, ease: 'power2.inOut' }, 0);
  tl.to(waxSealGroup.position, { z: 1.5, y: 0.2, duration: 0.55, ease: 'back.in(1.4)' }, 0);
  tl.to(waxSealGroup.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.25, ease: 'power2.in' }, 0.45);

  // 2. 3D Top Flap Hinges Open
  tl.to(topFlapPivot.rotation, { x: -Math.PI * 0.85, duration: 0.85, ease: 'power3.inOut' }, 0.2);

  // 3. Inner Golden Parchment Letter ("Rhian Jade Bianzon • January 9, 2027") Rises Out of the Envelope
  tl.to(innerLetterMesh.position, { y: 0.55, z: 0.26, duration: 0.95, ease: 'power3.out' }, 0.42);
  tl.to(innerLetterMesh.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.95, ease: 'power3.out' }, 0.42);

  // 4. Camera Zooms Straight INTO the Opened Envelope & Parts the 3D Stage Curtains into the Ballroom!
  tl.to(leftStageCurtain.position, { x: -8.5, duration: 1.55, ease: 'power3.inOut' }, 1.25);
  tl.to(rightStageCurtain.position, { x: 8.5, duration: 1.55, ease: 'power3.inOut' }, 1.25);
  tl.to(envBodyMesh.position, { y: -4.2, duration: 1.15, ease: 'power2.in' }, 1.3);
  tl.to(innerLetterMesh.scale, { x: 3.4, y: 3.4, z: 3.4, duration: 1.3, ease: 'power2.in' }, 1.35);
  tl.to(innerLetterMesh.material, { opacity: 0, duration: 0.6, ease: 'power2.in' }, 1.85);

  tl.to(
    camera.position,
    { z: 13.5, y: 0.3, duration: 1.7, ease: 'power3.inOut' },
    1.25
  );
}

// Inspect any 3D Portrait / Cinema / Scroll Frame
function inspect3DFrame(userData) {
  if (cameraOverride) return;
  cameraOverride = true;
  document.getElementById('back-to-corridor-btn').classList.remove('hidden');

  savedCorridorCam.x = camera.position.x;
  savedCorridorCam.y = camera.position.y;
  savedCorridorCam.z = camera.position.z;

  audio.playSealChime([329.63, 440.0, 554.37, 659.25]);

  gsap.to(camera.position, {
    x: userData.alignPos.x * responsiveScale,
    y: userData.alignPos.y,
    z: userData.alignPos.z,
    duration: 1.2,
    ease: 'power3.inOut'
  });
  gsap.to(lookAtProxy, {
    x: userData.lookTarget.x * responsiveScale,
    y: userData.lookTarget.y,
    z: userData.lookTarget.z,
    duration: 1.2,
    ease: 'power3.inOut'
  });
}

function exitFrameInspection() {
  if (!cameraOverride) return;
  audio.playHoverHint();
  document.getElementById('back-to-corridor-btn').classList.add('hidden');

  gsap.to(camera.position, {
    x: savedCorridorCam.x,
    y: savedCorridorCam.y,
    z: savedCorridorCam.z,
    duration: 1.1,
    ease: 'power3.inOut',
    onComplete: () => {
      currentZ = savedCorridorCam.z;
      targetZ = savedCorridorCam.z;
      cameraOverride = false;
    }
  });
  gsap.to(lookAtProxy, {
    x: 0,
    y: 0.25,
    z: savedCorridorCam.z - 10,
    duration: 1.1,
    ease: 'power3.inOut'
  });
}

document.getElementById('back-to-corridor-btn').addEventListener('click', exitFrameInspection);

// Desktop Wheel Scroll + Keyboard Navigation
window.addEventListener(
  'wheel',
  (e) => {
    if (!hasEnteredBallroom || cameraOverride) return;
    e.preventDefault();
    targetZ = THREE.MathUtils.clamp(targetZ - e.deltaY * 0.024, MIN_CORRIDOR_Z, MAX_CORRIDOR_Z);
  },
  { passive: false }
);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cameraOverride) {
    exitFrameInspection();
    return;
  }
  if (!hasEnteredBallroom || cameraOverride) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

  const keySteps = { ArrowDown: 2.5, ArrowUp: -2.5, PageDown: 8, PageUp: -8, ' ': 4 };
  if (keySteps[e.key] !== undefined) {
    e.preventDefault();
    targetZ = THREE.MathUtils.clamp(targetZ - keySteps[e.key], MIN_CORRIDOR_Z, MAX_CORRIDOR_Z);
  }
});

// Mobile Touch Drag + Momentum + Horizontal Swipe Glance (Portfolio useInfiniteCamera style!)
const touchState = { startX: 0, startY: 0, lastY: 0, velocityY: 0, isDragging: false };

window.addEventListener(
  'touchstart',
  (e) => {
    if (!e.touches.length) return;
    touchState.startX = e.touches[0].clientX;
    touchState.startY = e.touches[0].clientY;
    touchState.lastY = e.touches[0].clientY;
    touchState.velocityY = 0;
    touchState.isDragging = true;
  },
  { passive: true }
);

window.addEventListener(
  'touchmove',
  (e) => {
    if (!touchState.isDragging || !e.touches.length) return;
    if (!hasEnteredBallroom || cameraOverride) return;

    const curX = e.touches[0].clientX;
    const curY = e.touches[0].clientY;
    const deltaY = touchState.lastY - curY;
    const deltaX = touchState.startX - curX;

    touchState.velocityY = deltaY;
    targetZ = THREE.MathUtils.clamp(targetZ - deltaY * 0.065, MIN_CORRIDOR_Z, MAX_CORRIDOR_Z);

    // Subtle Horizontal Swipe Glance on Mobile
    targetSwipeGlance = THREE.MathUtils.clamp(targetSwipeGlance + deltaX * 0.0008, -0.28, 0.28);

    touchState.lastY = curY;
    touchState.startX = curX;
  },
  { passive: true }
);

window.addEventListener('touchend', () => {
  touchState.isDragging = false;
});

// Pointer Move: Articulated 3D Wax Seal & Flap Hover (ZERO Card Tilt!)
window.addEventListener('pointermove', (e) => {
  mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNorm.y = -((e.clientY / window.innerHeight) * 2 - 1);

  pointerNDC.x = mouseNorm.x;
  pointerNDC.y = mouseNorm.y;
  raycaster.setFromCamera(pointerNDC, camera);

  if (!hasEnteredBallroom && !isEnvelopeAnimating) {
    const hits = raycaster.intersectObjects(envelope3DGroup.children, true);
    if (hits.length > 0) {
      if (!isEnvelopeHovered) {
        isEnvelopeHovered = true;
        document.body.style.cursor = 'pointer';
        audio.playHoverHint();
        // Crack open ONLY the 3D Top Flap and turn the 3D Gold Rose Wax Seal!
        gsap.to(topFlapPivot.rotation, { x: -0.24, duration: 0.38, ease: 'power2.out' });
        gsap.to(waxSealGroup.rotation, { z: 0.22, duration: 0.38, ease: 'power2.out' });
        gsap.to(waxSealGroup.scale, { x: 1.12, y: 1.12, z: 1.12, duration: 0.38, ease: 'back.out(1.7)' });
      }
    } else if (isEnvelopeHovered) {
      isEnvelopeHovered = false;
      document.body.style.cursor = 'auto';
      gsap.to(topFlapPivot.rotation, { x: 0, duration: 0.35, ease: 'power2.out' });
      gsap.to(waxSealGroup.rotation, { z: 0, duration: 0.35, ease: 'power2.out' });
      gsap.to(waxSealGroup.scale, { x: 1, y: 1, z: 1, duration: 0.35, ease: 'power2.out' });
    }
    return;
  }

  if (hasEnteredBallroom && !cameraOverride) {
    const interactiveMeshes = [
      heroOvalObj.hitMesh,
      cinemaBuilt.hitMesh,
      rsvpLecternBuilt.hitMesh,
      ...galleryFrameObjects.map((g) => g.mesh),
      ...popScrollObjects.map((s) => s.mesh)
    ];
    const hits = raycaster.intersectObjects(interactiveMeshes, false);
    document.body.style.cursor = hits.length > 0 ? 'pointer' : 'auto';
  }
});

// Pointer Click: Open Envelope OR Inspect 3D Frame / Open RSVP
window.addEventListener('click', (e) => {
  if (e.target.closest('#navigation-ui, #station-context-bar, dialog')) return;

  pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointerNDC.y = -((e.clientY / window.innerHeight) * 2 - 1);
  raycaster.setFromCamera(pointerNDC, camera);

  if (!hasEnteredBallroom && !isEnvelopeAnimating) {
    const hits = raycaster.intersectObjects(envelope3DGroup.children, true);
    if (hits.length > 0) {
      triggerEnvelopeZoomOpen();
    }
    return;
  }

  if (hasEnteredBallroom && !cameraOverride) {
    const interactiveMeshes = [
      heroOvalObj.hitMesh,
      cinemaBuilt.hitMesh,
      rsvpLecternBuilt.hitMesh,
      ...galleryFrameObjects.map((g) => g.mesh),
      ...popScrollObjects.map((s) => s.mesh)
    ];
    const hits = raycaster.intersectObjects(interactiveMeshes, false);
    if (hits.length > 0) {
      const hitObj = hits[0].object;
      if (hitObj.userData.inspectable) {
        inspect3DFrame(hitObj.userData);
      } else if (hitObj.userData.isRsvpLectern) {
        openModalDialog(document.getElementById('rsvp-modal'));
      }
    }
  }
});

/* =========================================================================
   14. PORTFOLIO-STYLE NAVIGATION HUD, VELVET CURTAIN TELEPORT & MODALS
   ========================================================================= */
const mapToggleBtn = document.getElementById('map-toggle-btn');
const audioMenuBtn = document.getElementById('audio-menu-btn');
const mapPanel = document.getElementById('ballroom-map-panel');
const audioPanel = document.getElementById('audio-settings-panel');

mapToggleBtn.addEventListener('click', () => {
  const isOpen = mapPanel.classList.toggle('open');
  audioPanel.classList.remove('open');
  mapToggleBtn.setAttribute('aria-expanded', String(isOpen));
});

audioMenuBtn.addEventListener('click', () => {
  const isOpen = audioPanel.classList.toggle('open');
  mapPanel.classList.remove('open');
  audioMenuBtn.setAttribute('aria-expanded', String(isOpen));
});

document.getElementById('close-map-btn').addEventListener('click', () => mapPanel.classList.remove('open'));
document.getElementById('close-audio-btn').addEventListener('click', () => audioPanel.classList.remove('open'));

const curtainEl = document.getElementById('curtain-transition');
const leftWing = curtainEl.querySelector('.curtain-wing.left');
const rightWing = curtainEl.querySelector('.curtain-wing.right');
const curtainCrest = curtainEl.querySelector('.curtain-crest');

function teleportToZ(destinationZ) {
  mapPanel.classList.remove('open');
  if (cameraOverride) exitFrameInspection();

  curtainEl.style.display = 'block';
  gsap.set(leftWing, { xPercent: -100 });
  gsap.set(rightWing, { xPercent: 100 });
  gsap.set(curtainCrest, { opacity: 0, scale: 0.88 });

  const tl = gsap.timeline({
    onComplete: () => {
      curtainEl.style.display = 'none';
    }
  });

  tl.to([leftWing, rightWing], { xPercent: 0, duration: 0.65, ease: 'power3.inOut' }, 0);
  tl.to(curtainCrest, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }, 0.3);
  tl.add(() => {
    targetZ = destinationZ;
    currentZ = destinationZ;
    camera.position.z = destinationZ;
    audio.playSealChime([261.63, 329.63, 392.0, 523.25]);
  }, 0.7);
  tl.to(curtainCrest, { opacity: 0, duration: 0.25 }, 0.85);
  tl.to(leftWing, { xPercent: -100, duration: 0.85, ease: 'power3.inOut' }, 0.9);
  tl.to(rightWing, { xPercent: 100, duration: 0.85, ease: 'power3.inOut' }, 0.9);
}

document.querySelectorAll('.chapter-jump-btn[data-target-z]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const zVal = parseFloat(btn.dataset.targetZ);
    teleportToZ(zVal);
  });
});

document.getElementById('replay-envelope-btn').addEventListener('click', () => {
  mapPanel.classList.remove('open');
  if (cameraOverride) exitFrameInspection();
  hasEnteredBallroom = false;
  isEnvelopeAnimating = false;
  document.body.classList.add('locked-at-entrance');
  document.getElementById('entrance-hud').classList.remove('fade-out');

  entranceStageGroup.visible = true;
  envBodyMesh.position.set(0, 0, 0);
  waxSealGroup.position.set(0, -0.04, 0.11);
  waxSealGroup.rotation.set(0, 0, 0);
  waxSealGroup.scale.set(1, 1, 1);
  topFlapPivot.rotation.set(0, 0, 0);
  innerLetterMesh.visible = false;
  innerLetterMesh.position.set(0, -0.05, 0.055);
  innerLetterMesh.scale.setScalar(0.84);
  innerLetterMesh.material.opacity = 1;
  leftStageCurtain.position.set(-2.6, 0.2, -1.1);
  rightStageCurtain.position.set(2.6, 0.2, -1.1);
  camera.position.set(0, 0.3, 28);
});

// Audio Sliders
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

// Native <dialog closedby="any"> Modals + Mandatory Safari Fallback (`light-dismiss-a-dialog`)
function setupLightDismissDialog(dlg) {
  if (!dlg) return;
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dlg.addEventListener('click', (event) => {
      if (event.target !== dlg) return;
      const rect = dlg.getBoundingClientRect();
      const inside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!inside) dlg.close();
    });
  }
}

const rsvpModal = document.getElementById('rsvp-modal');
const venueModal = document.getElementById('venue-modal');
setupLightDismissDialog(rsvpModal);
setupLightDismissDialog(venueModal);

function openModalDialog(dlg) {
  if (!dlg) return;
  audio.playHoverHint();
  dlg.showModal();
}

document.getElementById('open-rsvp-drawer-btn').addEventListener('click', () => openModalDialog(rsvpModal));
document.getElementById('close-rsvp-modal-btn').addEventListener('click', () => rsvpModal.close());
document.getElementById('open-map-modal-btn').addEventListener('click', () => openModalDialog(venueModal));
document.getElementById('close-venue-modal-btn').addEventListener('click', () => venueModal.close());

// Draw Golden QR Code in Venue Modal
const qrCanvas = document.getElementById('qr-canvas');
if (qrCanvas) {
  const qctx = qrCanvas.getContext('2d');
  qctx.fillStyle = '#090204';
  qctx.fillRect(0, 0, 180, 180);
  qctx.fillStyle = '#d4af37';
  const seed = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1]
  ];
  for (let r = 0; r < 19; r++) {
    for (let c = 0; c < 19; c++) {
      const rowPattern = seed[r % seed.length];
      if (rowPattern[c % rowPattern.length]) {
        qctx.fillRect(14 + c * 8, 14 + r * 8, 6.5, 6.5);
      }
    }
  }
}

// RSVP Wax Stamp Form Submission
const rsvpForm = document.getElementById('rsvp-production-form');
const waxStampInteractive = document.getElementById('wax-stamp-interactive');
const sealSubmitBtn = document.getElementById('seal-rsvp-submit-btn');
const sealBtnText = document.getElementById('seal-btn-text');
const rsvpConfirmMsg = document.getElementById('rsvp-confirmation-msg');

rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault();
  waxStampInteractive.classList.add('stamping');
  audio.playSealChime([261.63, 329.63, 392.0, 523.25, 659.25, 783.99]);

  setTimeout(() => {
    waxStampInteractive.classList.remove('stamping');
    sealSubmitBtn.classList.add('sealed');
    sealBtnText.innerHTML = '♛<br/>RSVP SEALED<br/>01.09.2027';
    rsvpConfirmMsg.classList.remove('hidden');
  }, 520);
});

/* =========================================================================
   15. MAIN 60FPS RENDER & SPATIAL ANIMATION LOOP
   ========================================================================= */
const clock = new THREE.Clock();
const ctxLocation = document.getElementById('context-location');
const ctxRsvp = document.getElementById('context-rsvp');
const progEl = document.getElementById('progress');

updateResponsiveCamera();
window.addEventListener('resize', updateResponsiveCamera);

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  // Apply Responsive Scale to 3D Stations so mobile screens never clip side elements
  envelope3DGroup.scale.setScalar(responsiveScale);
  heroStationGroup.scale.setScalar(responsiveScale);
  countdownStationGroup.scale.setScalar(responsiveScale);
  cinemaBuilt.group.scale.setScalar(responsiveScale);
  clocheSanctuary.scale.setScalar(responsiveScale);
  rsvpAltarGroup.scale.setScalar(responsiveScale);

  // Smooth Mouse Parallax & Mobile Swipe Glance
  smoothParallax.x = THREE.MathUtils.lerp(smoothParallax.x, mouseNorm.x * 0.38, 0.05);
  smoothParallax.y = THREE.MathUtils.lerp(smoothParallax.y, mouseNorm.y * 0.22, 0.05);
  currentSwipeGlance = THREE.MathUtils.lerp(currentSwipeGlance, targetSwipeGlance, 0.08);

  if (!hasEnteredBallroom && !isEnvelopeAnimating) {
    // Envelope breathes gently in 3D space (NO card tilting on hover!)
    envelope3DGroup.position.y = Math.sin(time * 1.4) * 0.04;
    waxHaloRing.rotation.z = time * 0.4;
    camera.position.x = smoothParallax.x * 0.25;
    camera.position.y = 0.3 + smoothParallax.y * 0.18;
    camera.lookAt(0, 0.25, ENTRANCE_Z);
  } else if (hasEnteredBallroom && !cameraOverride) {
    // Apply Mobile Touch Inertia when finger lifts
    if (!touchState.isDragging && Math.abs(touchState.velocityY) > 0.1) {
      targetZ = THREE.MathUtils.clamp(targetZ - touchState.velocityY * 0.03, MIN_CORRIDOR_Z, MAX_CORRIDOR_Z);
      touchState.velocityY *= 0.92;
    }

    currentZ = THREE.MathUtils.lerp(currentZ, targetZ, 0.055);

    // Update Walk Progress Indicator
    const walkProgress = (MAX_CORRIDOR_Z - currentZ) / (MAX_CORRIDOR_Z - MIN_CORRIDOR_Z);
    if (progEl) progEl.style.transform = `scaleX(${Math.max(0, Math.min(1, walkProgress))})`;

    // Auto-Glance toward nearby Gallery Portrait Alcoves
    let glanceX = 0;
    galleryFrameObjects.forEach((f) => {
      const dist = currentZ - f.z;
      if (dist > -2 && dist < 11) {
        const strength = Math.sin(((dist + 2) / 13) * Math.PI);
        glanceX += (f.side === 'left' ? -1 : 1) * strength * 0.55;
      }
    });

    camera.position.z = currentZ;
    camera.position.x = smoothParallax.x;
    camera.position.y = 0.3 + smoothParallax.y;

    // Keep the deep Palace Ballroom Horizon Vista moving ahead of the camera
    farBallroomPlane.position.z = currentZ - 26;
    farBallroomPlane.position.x = smoothParallax.x * 0.25;

    lookAtProxy.set(
      smoothParallax.x * 0.35 + glanceX + currentSwipeGlance * 3.5,
      0.25 + smoothParallax.y * 0.45,
      currentZ - 10
    );
    camera.lookAt(lookAtProxy);

    // Show contextual bottom action pills near Location & RSVP stations
    ctxLocation.classList.toggle('hidden', !(currentZ < -4 && currentZ > -18));
    ctxRsvp.classList.toggle('hidden', !(currentZ < -96));
  } else if (cameraOverride) {
    camera.lookAt(lookAtProxy);
  }

  // 1. Hero Split-Letter Animation ("RHIAN JADE" splits apart as camera walks through Z = 6.5!)
  const distToHeroText = camera.position.z - HERO_TEXT_Z;
  let splitTarget = 0;
  if (distToHeroText < 5.5 && distToHeroText > -2.5) {
    const norm = 1 - Math.abs(distToHeroText - 1.2) / 4.3;
    splitTarget = Math.max(0, norm) * 2.6;
  }

  heroLetterMeshes.forEach((m) => {
    const targetX = m.userData.baseX + m.userData.splitDir * splitTarget;
    m.position.x = THREE.MathUtils.lerp(m.position.x, targetX, 0.08);
    m.position.y = Math.sin(time * 1.2 + m.userData.idx * 0.4) * 0.035;
  });

  // 2. Dynamic Proximity Tilt on Sawtooth Gallery Frames (DoorSection.jsx pattern)
  galleryFrameObjects.forEach((item) => {
    item.group.position.x = (item.side === 'left' ? -3.1 : 3.1) * responsiveScale;
    item.group.scale.setScalar(responsiveScale);
    const d = Math.abs(camera.position.z - item.z);
    const targetAngle = d < 11 ? 0.38 : 0.88;
    item.currentTilt = THREE.MathUtils.lerp(item.currentTilt, targetAngle, 0.06);
    item.group.rotation.y = item.side === 'left' ? item.currentTilt : -item.currentTilt;
  });

  // 3. SEPARATE 18S PARCHMENT SCROLLS THAT AUTOMATICALLY POP & UNFURL ON SCROLL!
  enchantedRose3D.rotation.y = time * 0.45;
  enchantedRose3D.position.y = 0.55 + Math.sin(time * 1.8) * 0.05;

  popScrollObjects.forEach((sc) => {
    sc.root.position.x = sc.baseX * responsiveScale;
    sc.root.scale.setScalar(responsiveScale);

    // When the camera walks within 13 units of this 18s scroll, it automatically pops open & unfurls!
    const distZ = camera.position.z - sc.z;
    const shouldBeOpen = distZ < 13.5 && distZ > -6;

    if (shouldBeOpen && !sc.isPopped) {
      sc.isPopped = true;
      audio.playHoverHint();
      gsap.to(sc.unfurlGroup.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.95,
        ease: 'back.out(1.35)'
      });
    } else if (!shouldBeOpen && sc.isPopped) {
      sc.isPopped = false;
      gsap.to(sc.unfurlGroup.scale, {
        x: 0.75,
        y: 0.06,
        z: 0.75,
        duration: 0.55,
        ease: 'power2.in'
      });
    }
  });

  // 4. Animate 3D Dress Code Spheres & Chandelier Flames
  crimsonOrbMesh.rotation.y = time * 0.5;
  goldOrbMesh.rotation.y = -time * 0.6;
  blackOrbMesh.rotation.y = time * 0.45;

  chandelierFlames.forEach((fl, idx) => {
    const s = 0.9 + Math.sin(time * 6 + idx) * 0.15;
    fl.scale.set(0.7 * s, 1.5 * s, 0.7 * s);
  });

  petals.forEach((p) => {
    p.position.y -= p.userData.speedY;
    p.position.x += Math.sin(time + p.userData.sway) * 0.008;
    p.rotation.x += p.userData.rotX;
    p.rotation.z += p.userData.rotZ;
    if (p.position.y < -2.1) p.position.y = 6.5;
  });

  renderer.render(scene, camera);
}

animate();
