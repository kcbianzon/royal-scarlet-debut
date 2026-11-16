import * as THREE from 'three';
import gsap from 'gsap';

/* =========================================================================
   0. DEBUT PRODUCTION CONSTANTS (Rhian Jade Bianzon • January 9, 2027)
   ========================================================================= */
const DEBUTANTE_FULL_NAME = 'Rhian Jade Bianzon';
const DEBUTANTE_FIRST_NAME = 'RHIAN JADE';
const DEBUTANTE_LAST_NAME = 'BIANZON';
const DEBUT_DATE_ISO = '2027-01-09T17:00:00+08:00';
const DEBUT_DATE_DISPLAY = 'JANUARY 9, 2027';

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

        const peak = 0.065 * this.sfxVolume;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(peak, start + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 2.5);
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
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.18);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.025 * this.sfxVolume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } catch (_) {}
  }

  startWaltz() {
    if (this.isWaltzRunning) return;
    this.init();
    this.isWaltzRunning = true;
    const waltzProgression = [
      [220.0, 261.63, 329.63, 440.0, 523.25], // Am
      [174.61, 220.0, 261.63, 349.23, 440.0], // Fmaj7
      [196.0, 246.94, 293.66, 392.0, 493.88], // G
      [164.81, 207.65, 246.94, 329.63, 415.3] // E
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
          const vol = (i === 0 ? 0.045 : 0.028) * this.musicVolume;
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
   2. HIGH-DPI PROCEDURAL 3D CANVAS TEXTURES (Zero Boxed HTML Cards!)
   ========================================================================= */
function createEnvelopeInvitationTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1360;
  const ctx = canvas.getContext('2d');

  // Rich Vintage Royal Parchment Gradient
  const grad = ctx.createRadialGradient(512, 680, 80, 512, 680, 760);
  grad.addColorStop(0, '#fbf2df');
  grad.addColorStop(0.65, '#edd9b8');
  grad.addColorStop(1, '#c8a675');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1360);

  // Double Ornate 24k Gold Filigree Borders
  ctx.strokeStyle = '#8a6415';
  ctx.lineWidth = 14;
  ctx.strokeRect(42, 42, 940, 1276);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(64, 64, 896, 1232);
  ctx.strokeRect(76, 76, 872, 1208);

  // Corner Filigree Flourishes
  const corners = [
    [88, 88],
    [936, 88],
    [88, 1272],
    [936, 1272]
  ];
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#d4af37';
    ctx.fill();
    ctx.strokeStyle = '#5c3c06';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  // Royal Crown & Crest
  ctx.fillStyle = '#7a5410';
  ctx.font = 'bold 54px Cinzel, serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚜ ♛ ⚜', 512, 185);

  ctx.fillStyle = '#6e0515';
  ctx.font = 'italic 52px "Cormorant Garamond", serif';
  ctx.fillText('You are cordially invited to the celebration of', 512, 310);

  // Debutante Name in Grand Regal Script & Serif
  ctx.fillStyle = '#8b0018';
  ctx.font = 'bold 86px Cinzel, serif';
  ctx.fillText('RHIAN JADE', 512, 465);

  ctx.fillStyle = '#5a0310';
  ctx.font = 'bold 58px Cinzel, serif';
  ctx.fillText('BIANZON', 512, 550);

  // Gold Divider Line
  ctx.strokeStyle = '#9e741c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(240, 615);
  ctx.lineTo(784, 615);
  ctx.stroke();

  ctx.fillStyle = '#4a040d';
  ctx.font = '600 38px Cinzel, serif';
  ctx.fillText('A DECADE AND EIGHT', 512, 685);

  // Debut Date: Saturday, January 9, 2027
  ctx.fillStyle = '#8b0018';
  ctx.font = 'bold 64px Cinzel, serif';
  ctx.fillText('JANUARY 9, 2027', 512, 830);

  ctx.fillStyle = '#4a040d';
  ctx.font = '600 34px Cinzel, serif';
  ctx.fillText('SATURDAY • FIVE O’CLOCK IN THE EVENING', 512, 905);

  ctx.fillStyle = '#7a5410';
  ctx.font = 'italic 42px "Cormorant Garamond", serif';
  ctx.fillText('The Grand Royal Ballroom', 512, 1030);

  ctx.fillStyle = '#8b0018';
  ctx.font = 'bold 34px Cinzel, serif';
  ctx.fillText('✦ ROYAL SCARLET, GOLD & OBSIDIAN ✦', 512, 1165);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createCharTexture(char, color = '#f7e49e', fontSize = 150) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 256, 256);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Gold Glow & Shadow
  ctx.shadowColor = 'rgba(212, 175, 55, 0.85)';
  ctx.shadowBlur = 18;
  ctx.font = `700 ${fontSize}px "Cinzel Decorative", Cinzel, serif`;

  const grad = ctx.createLinearGradient(0, 40, 0, 216);
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

  // Ornamental Gold Filigree Line
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(280, 60);
  ctx.lineTo(1120, 60);
  ctx.stroke();

  const grad = ctx.createLinearGradient(0, 90, 0, 230);
  grad.addColorStop(0, '#fff9e2');
  grad.addColorStop(0.55, '#d4af37');
  grad.addColorStop(1, '#8c6516');
  ctx.fillStyle = grad;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 20;
  ctx.font = '700 72px "Cinzel Decorative", Cinzel, serif';
  ctx.fillText(title, 700, 175);

  ctx.fillStyle = '#faefd7';
  ctx.font = '600 34px Cinzel, serif';
  ctx.fillText(subtitle, 700, 255);

  if (detail) {
    ctx.fillStyle = '#d4af37';
    ctx.font = 'italic 36px "Cormorant Garamond", serif';
    ctx.fillText(detail, 700, 325);
  }

  ctx.beginPath();
  ctx.moveTo(380, 365);
  ctx.lineTo(1020, 365);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createProgramScrollTexture(title, subtitle, items) {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');

  // Aged Royal Parchment Surface
  const grad = ctx.createRadialGradient(450, 640, 60, 450, 640, 680);
  grad.addColorStop(0, '#f9eed8');
  grad.addColorStop(0.7, '#e6cfa8');
  grad.addColorStop(1, '#be9b68');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 900, 1280);

  // Gilded Lace Side Borders
  ctx.strokeStyle = '#7a5410';
  ctx.lineWidth = 10;
  ctx.strokeRect(36, 36, 828, 1208);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  ctx.strokeRect(52, 52, 796, 1176);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#7a5410';
  ctx.font = 'bold 36px Cinzel, serif';
  ctx.fillText('⚜ ♛ ⚜', 450, 120);

  ctx.fillStyle = '#8b0018';
  ctx.font = 'bold 56px Cinzel, serif';
  ctx.fillText(title, 450, 190);

  ctx.fillStyle = '#4a040d';
  ctx.font = 'italic 32px "Cormorant Garamond", serif';
  ctx.fillText(subtitle, 450, 240);

  ctx.strokeStyle = 'rgba(138, 100, 21, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 268);
  ctx.lineTo(760, 268);
  ctx.stroke();

  // Two Columns of 9 Honored Guests (18 Total)
  ctx.textAlign = 'left';
  ctx.font = '600 28px Cinzel, serif';
  for (let i = 0; i < 18; i++) {
    const col = i < 9 ? 0 : 1;
    const row = i % 9;
    const x = col === 0 ? 88 : 475;
    const y = 345 + row * 92;
    const num = String(i + 1).padStart(2, '0');
    const label = items[i] || `Honored Guest ${num}`;

    ctx.fillStyle = '#8b0018';
    ctx.fillText(`${num}.`, x, y);

    ctx.fillStyle = '#2d0409';
    ctx.font = '600 26px "Cormorant Garamond", serif';
    ctx.fillText(label, x + 52, y);

    ctx.strokeStyle = 'rgba(122, 84, 16, 0.32)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 14);
    ctx.lineTo(x + 330, y + 14);
    ctx.stroke();
    ctx.font = '600 28px Cinzel, serif';
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#6e0515';
  ctx.font = 'italic 30px "Cormorant Garamond", serif';
  ctx.fillText('Rhian Jade Bianzon • January 9, 2027', 450, 1195);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* =========================================================================
   3.CUSTOM FEATHERED ALPHA SHADER FOR SEAMLESS 3D ARTWORK INTEGRATION
   (Removes rectangular JPEG borders so ornate gold frames float in 3D space!)
   ========================================================================= */
function createFeatheredArtworkMaterial(texture, ovalMask = false) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: texture },
      uOval: { value: ovalMask ? 1.0 : 0.0 },
      uGlow: { value: 0.18 }
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform float uOval;
      uniform float uGlow;
      varying vec2 vUv;

      void main() {
        vec4 texColor = texture2D(uMap, vUv);
        vec2 centered = (vUv - 0.5) * 2.0;

        float dist;
        if (uOval > 0.5) {
          dist = length(centered * vec2(1.05, 1.0));
        } else {
          vec2 d = abs(centered);
          dist = max(d.x, d.y) + 0.12 * length(centered);
        }

        // Smoothly feather outer edges into the dark obsidian 3D fog
        float edgeAlpha = 1.0 - smoothstep(0.76, 0.99, dist);

        // Also key out ultra-dark background pixels near the perimeter so only the gold filigree & roses remain
        float luma = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
        float perimeterFade = smoothstep(0.62, 0.95, dist);
        float bgKey = mix(1.0, smoothstep(0.02, 0.14, luma), perimeterFade);

        vec3 finalRgb = texColor.rgb + vec3(0.83, 0.68, 0.21) * uGlow * (1.0 - dist);
        gl_FragColor = vec4(finalRgb, texColor.a * edgeAlpha * bgKey);
      }
    `
  });
}

/* =========================================================================
   4. MAIN THREE.JS WORLD SETUP (`#webgl-canvas`)
   ========================================================================= */
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060203);
scene.fog = new THREE.FogExp2(0x060203, 0.032);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 140);
// Start at Z = 28 facing the 3D Envelope at Z = 22 (exact EntranceDoors.jsx setup!)
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

const textureLoader = new THREE.TextureLoader();
const ovalFrameTex = textureLoader.load('./assets/baroque_oval_frame.jpg');
const rectFrameTex = textureLoader.load('./assets/baroque_rect_frame.jpg');
const clocheArtTex = textureLoader.load('./assets/enchanted_rose_cloche.jpg');
const parchmentCardTex = textureLoader.load('./assets/baroque_parchment_card.jpg');
[ovalFrameTex, rectFrameTex, clocheArtTex, parchmentCardTex].forEach((t) => {
  t.colorSpace = THREE.SRGBColorSpace;
});

// Shared PBR Materials
const goldPBR = new THREE.MeshStandardMaterial({
  color: 0xd4af37,
  metalness: 0.94,
  roughness: 0.2
});
const darkGoldPBR = new THREE.MeshStandardMaterial({
  color: 0x8a6415,
  metalness: 0.9,
  roughness: 0.28
});
const crimsonVelvetPBR = new THREE.MeshPhysicalMaterial({
  color: 0x7a0014,
  roughness: 0.65,
  metalness: 0.1,
  clearcoat: 0.2
});
const obsidianMarblePBR = new THREE.MeshStandardMaterial({
  color: 0x090305,
  roughness: 0.25,
  metalness: 0.4
});

// Global & Camera-Attached Candlelight
const ambientLight = new THREE.AmbientLight(0x4a0812, 1.85);
scene.add(ambientLight);

const cameraTorch = new THREE.PointLight(0xffdf91, 6.5, 28);
camera.add(cameraTorch);
scene.add(camera);

/* =========================================================================
   5. CONTINUOUS 3D ROYAL BALLROOM CORRIDOR ARCHITECTURE (Z = 26 to Z = -100)
   ========================================================================= */
const ballroomArchitecture = new THREE.Group();
scene.add(ballroomArchitecture);

// Obsidian Marble Floor & Royal Crimson Carpet Runner with 24k Gold Trim
const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(36, 150), obsidianMarblePBR);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.set(0, -2.2, -38);
ballroomArchitecture.add(floorMesh);

const carpetMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 150), crimsonVelvetPBR);
carpetMesh.rotation.x = -Math.PI / 2;
carpetMesh.position.set(0, -2.18, -38);
ballroomArchitecture.add(carpetMesh);

[-2.85, 2.85].forEach((xPos) => {
  const trim = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 150), goldPBR);
  trim.position.set(xPos, -2.17, -38);
  ballroomArchitecture.add(trim);
});

// Repeated Golden Baroque Archways, Columns & Hanging Lanterns along Z
const lanternFlames = [];
for (let z = 18; z >= -94; z -= 12) {
  // Golden Filigree Archway Ring
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(6.4, 0.06, 16, 90, Math.PI),
    goldPBR
  );
  arch.position.set(0, -2.2, z);
  ballroomArchitecture.add(arch);

  // Left & Right Fluted Obsidian & Gold Columns
  [-5.8, 5.8].forEach((xCol) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 7.5, 20), obsidianMarblePBR);
    col.position.set(xCol, 1.55, z);
    ballroomArchitecture.add(col);

    const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.35, 20), goldPBR);
    baseRing.position.set(xCol, -2.02, z);
    ballroomArchitecture.add(baseRing);

    // Hanging Golden Lantern
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(xCol * 0.72, 3.2, z + 3);
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.4, 8), goldPBR);
    chain.position.y = 0.7;
    lanternGroup.add(chain);

    const lanternCage = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.48, 6), goldPBR);
    lanternGroup.add(lanternCage);

    const glowCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffe596 })
    );
    lanternGroup.add(glowCore);
    lanternFlames.push(glowCore);
    ballroomArchitecture.add(lanternGroup);
  });
}

/* =========================================================================
   6. STAGE 0 (Z = 22): 3D ROYAL ENVELOPE & ZOOM-THROUGH PORTAL ENTRANCE
   (Inspired by EntranceDoors.jsx in Kenneth's portfolio!)
   ========================================================================= */
const ENTRANCE_Z = 22;
const entranceGroup = new THREE.Group();
entranceGroup.position.set(0, 0.25, ENTRANCE_Z);
scene.add(entranceGroup);

// 3D Parting Royal Crimson Velvet Curtains behind the Envelope
const curtainGeo = new THREE.BoxGeometry(4.8, 7.2, 0.18);
const leftEntranceCurtain = new THREE.Mesh(curtainGeo, crimsonVelvetPBR);
leftEntranceCurtain.position.set(-2.35, 0.4, -0.8);
entranceGroup.add(leftEntranceCurtain);

const rightEntranceCurtain = new THREE.Mesh(curtainGeo, crimsonVelvetPBR);
rightEntranceCurtain.position.set(2.35, 0.4, -0.8);
entranceGroup.add(rightEntranceCurtain);

// 3D Envelope Assembly
const envelope3DGroup = new THREE.Group();
entranceGroup.add(envelope3DGroup);

const ENV_W = 4.5;
const ENV_H = 3.1;

// Envelope Back Plate (Obsidian Velvet + Gold Filigree Rim)
const envBackMesh = new THREE.Mesh(
  new THREE.BoxGeometry(ENV_W, ENV_H, 0.08),
  new THREE.MeshStandardMaterial({ color: 0x0b0204, roughness: 0.7, metalness: 0.2 })
);
envelope3DGroup.add(envBackMesh);

const envGoldRim = new THREE.Mesh(
  new THREE.BoxGeometry(ENV_W + 0.1, ENV_H + 0.1, 0.06),
  goldPBR
);
envGoldRim.position.z = -0.02;
envelope3DGroup.add(envGoldRim);

// Inner Pop-Out Golden Invitation Letter Mesh (Rises when opened, then camera zooms into it!)
const letterTex = createEnvelopeInvitationTexture();
const innerLetterMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(ENV_W * 0.78, ENV_H * 1.06),
  new THREE.MeshBasicMaterial({ map: letterTex, transparent: true })
);
innerLetterMesh.position.set(0, -0.08, 0.06);
innerLetterMesh.scale.setScalar(0.88);
envelope3DGroup.add(innerLetterMesh);

// Crimson Satin Side & Bottom Pocket Flaps (Split left/right so they can peel open during zoom!)
const leftPocketFlap = new THREE.Mesh(
  new THREE.BoxGeometry(ENV_W * 0.5, ENV_H, 0.04),
  crimsonVelvetPBR
);
leftPocketFlap.position.set(-ENV_W * 0.25, 0, 0.09);
envelope3DGroup.add(leftPocketFlap);

const rightPocketFlap = new THREE.Mesh(
  new THREE.BoxGeometry(ENV_W * 0.5, ENV_H, 0.04),
  crimsonVelvetPBR
);
rightPocketFlap.position.set(ENV_W * 0.25, 0, 0.09);
envelope3DGroup.add(rightPocketFlap);

// Diagonal Gold Filigree Bars across the Envelope Front
const diagLen = Math.hypot(ENV_W * 0.5, ENV_H * 0.5);
const diagAngle = Math.atan2(ENV_H * 0.5, ENV_W * 0.5);
[-1, 1].forEach((dir) => {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(diagLen, 0.055, 0.05), goldPBR);
  bar.position.set((dir * ENV_W) / 4, -ENV_H / 4, 0.115);
  bar.rotation.z = -dir * diagAngle;
  leftPocketFlap.attach(bar);
});

// 3D Top Triangular Opening Flap (Pivots at top edge Y = +ENV_H / 2)
const topFlapPivot = new THREE.Group();
topFlapPivot.position.set(0, ENV_H / 2, 0.12);
envelope3DGroup.add(topFlapPivot);

const flapShape = new THREE.Shape();
flapShape.moveTo(-ENV_W / 2, 0);
flapShape.lineTo(ENV_W / 2, 0);
flapShape.lineTo(0, -ENV_H * 0.58);
flapShape.closePath();

const topFlapMesh = new THREE.Mesh(
  new THREE.ExtrudeGeometry(flapShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 }),
  new THREE.MeshStandardMaterial({ color: 0x110306, roughness: 0.55, metalness: 0.25, side: THREE.DoubleSide })
);
topFlapPivot.add(topFlapMesh);

// 3D Embossed Metallic Gold Rose Wax Seal (Centered on the Envelope)
const waxSealGroup = new THREE.Group();
waxSealGroup.position.set(0, -0.05, 0.18);
envelope3DGroup.add(waxSealGroup);

const waxDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.5, 0.09, 40), goldPBR);
waxDisc.rotation.x = Math.PI / 2;
waxSealGroup.add(waxDisc);

const waxInnerRing = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.028, 16, 48), darkGoldPBR);
waxInnerRing.position.z = 0.05;
waxSealGroup.add(waxInnerRing);

// Sculpted 3D Gold Rose Petals inside the Wax Seal
for (let i = 0; i < 12; i++) {
  const angle = (i / 12) * Math.PI * 2;
  const r = i < 5 ? 0.11 : 0.22;
  const petal = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), goldPBR);
  petal.scale.set(1.2, 0.6, 0.4);
  petal.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0.065);
  petal.rotation.z = angle;
  waxSealGroup.add(petal);
}

const sealPointLight = new THREE.PointLight(0xffe28a, 4.5, 8);
sealPointLight.position.set(0, 0, 1.2);
waxSealGroup.add(sealPointLight);

/* =========================================================================
   7. STATION I (Z = 6.5 & Z = 1.5): SPLIT-LETTER 3D HERO ("RHIAN JADE") & OVAL PORTRAIT
   (Inspired directly by HeroText.jsx in Kenneth's portfolio!)
   ========================================================================= */
const heroStationGroup = new THREE.Group();
scene.add(heroStationGroup);

// Individual 3D Split Letters for "RHIAN JADE" at Z = 6.5
const HERO_TEXT_Z = 6.5;
const splitLettersGroup = new THREE.Group();
splitLettersGroup.position.set(0, 0.85, HERO_TEXT_Z);
heroStationGroup.add(splitLettersGroup);

const heroChars = [...DEBUTANTE_FIRST_NAME];
const charCenter = (heroChars.length - 1) / 2;
const heroLetterMeshes = [];

heroChars.forEach((ch, idx) => {
  const offset = idx - charCenter;
  const baseX = offset * 0.62;
  const splitDir = offset * 0.75;
  if (ch === ' ') return;

  const tex = createCharTexture(ch, '#f7e49e', 165);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.82, 0.82),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  mesh.position.set(baseX, 0, 0);
  mesh.userData = { baseX, splitDir, idx };
  splitLettersGroup.add(mesh);
  heroLetterMeshes.push(mesh);
});

// Subtitle Words ("BIANZON" & "A DECADE AND EIGHT • JANUARY 9, 2027") that also part smoothly
const heroSubBannerTex = createFloatingBannerTexture(
  DEBUTANTE_LAST_NAME,
  'A DECADE AND EIGHT',
  'Saturday, January 9, 2027'
);
const heroSubBannerMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(5.8, 1.75),
  new THREE.MeshBasicMaterial({ map: heroSubBannerTex, transparent: true, depthWrite: false })
);
heroSubBannerMesh.position.set(0, -0.55, HERO_TEXT_Z);
heroStationGroup.add(heroSubBannerMesh);

// Central Carved 24k Baroque Oval Portrait Mirror at Z = 1.2 (Feathered Shader - Zero Box Edges!)
const heroOvalMat = createFeatheredArtworkMaterial(ovalFrameTex, true);
const heroOvalMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 5.75), heroOvalMat);
heroOvalMesh.position.set(0, 0.35, 1.2);
heroOvalMesh.userData = {
  inspectable: true,
  alignPos: { x: 0, y: 0.35, z: 5.2 },
  lookTarget: { x: 0, y: 0.35, z: 1.2 },
  stationLabel: 'RHIAN JADE BIANZON • GRAND PORTRAIT'
};
heroStationGroup.add(heroOvalMesh);

// Subtle Monogram Emblem inside the Oval Smoked Mirror
const ovalMonogramTex = createFloatingBannerTexture('R J B', 'EIGHTEENTH DEBUT', '01 . 09 . 2027');
const ovalMonogramMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2.1, 0.65),
  new THREE.MeshBasicMaterial({ map: ovalMonogramTex, transparent: true, depthWrite: false })
);
ovalMonogramMesh.position.set(0, 0.32, 1.25);
heroStationGroup.add(ovalMonogramMesh);

/* =========================================================================
   8. STATION II (Z = -14): LIVE 3D COUNTDOWN TO JANUARY 9, 2027 & SANCTUARY
   ========================================================================= */
const countdownStationGroup = new THREE.Group();
countdownStationGroup.position.set(0, 0.3, -14);
scene.add(countdownStationGroup);

// Dynamic Live Countdown CanvasTexture (Updated Every Second!)
const cdCanvas = document.createElement('canvas');
cdCanvas.width = 1600;
cdCanvas.height = 640;
const cdCtx = cdCanvas.getContext('2d');
const cdTexture = new THREE.CanvasTexture(cdCanvas);
cdTexture.colorSpace = THREE.SRGBColorSpace;

function updateLiveCountdownTexture() {
  const now = new Date().getTime();
  const target = new Date(DEBUT_DATE_ISO).getTime();
  const diff = Math.max(0, Math.floor((target - now) / 1000));

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  const secs = diff % 60;

  cdCtx.clearRect(0, 0, 1600, 640);
  cdCtx.textAlign = 'center';

  // Header
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
    // Ornate Gold Filigree Ring around each Countdown Unit
    cdCtx.strokeStyle = 'rgba(212, 175, 55, 0.75)';
    cdCtx.lineWidth = 4;
    cdCtx.beginPath();
    cdCtx.arc(u.x, 285, 135, 0, Math.PI * 2);
    cdCtx.stroke();

    cdCtx.strokeStyle = 'rgba(139, 0, 24, 0.65)';
    cdCtx.lineWidth = 2;
    cdCtx.beginPath();
    cdCtx.arc(u.x, 285, 122, 0, Math.PI * 2);
    cdCtx.stroke();

    const grad = cdCtx.createLinearGradient(0, 190, 0, 350);
    grad.addColorStop(0, '#fff9df');
    grad.addColorStop(0.55, '#d4af37');
    grad.addColorStop(1, '#8c6414');
    cdCtx.fillStyle = grad;
    cdCtx.font = '700 105px Cinzel, serif';
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

  // Footer Venue Info
  cdCtx.fillStyle = '#faefd7';
  cdCtx.font = 'italic 42px "Cormorant Garamond", serif';
  cdCtx.fillText('The Grand Royal Ballroom • Doors Open at 5:00 PM', 800, 525);

  cdCtx.fillStyle = '#d4af37';
  cdCtx.font = '600 26px Cinzel, serif';
  cdCtx.fillText('RHIAN JADE BIANZON • A DECADE AND EIGHT', 800, 585);

  cdTexture.needsUpdate = true;
}

updateLiveCountdownTexture();
setInterval(updateLiveCountdownTexture, 1000);

const countdownHoloMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(7.8, 3.12),
  new THREE.MeshBasicMaterial({ map: cdTexture, transparent: true, depthWrite: false })
);
countdownStationGroup.add(countdownHoloMesh);

/* =========================================================================
   9. STATION III (Z = -28 to Z = -52): 3D SAWTOOTH PORTRAIT CORRIDOR & CINEMA
   (Inspired directly by DoorSection.jsx in Kenneth's portfolio!)
   ========================================================================= */
const galleryFramesData = [
  { z: -28, side: 'left', title: 'ROYAL PORTRAIT I', sub: 'Rhian Jade • Pre-Debut Collection' },
  { z: -34, side: 'right', title: 'ROYAL PORTRAIT II', sub: 'Crimson & Gold Couture' },
  { z: -40, side: 'left', title: 'ROYAL PORTRAIT III', sub: 'Midnight Ballroom Series' },
  { z: -46, side: 'right', title: 'ROYAL PORTRAIT IV', sub: 'A Decade and Eight' }
];

const galleryFrameObjects = [];
const rectFeatheredMat = createFeatheredArtworkMaterial(rectFrameTex, false);

galleryFramesData.forEach((item) => {
  const pivotGroup = new THREE.Group();
  const xPos = item.side === 'left' ? -3.4 : 3.4;
  pivotGroup.position.set(xPos, 0.25, item.z);
  scene.add(pivotGroup);

  const frameMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.65), rectFeatheredMat.clone());
  pivotGroup.add(frameMesh);

  const captionTex = createFloatingBannerTexture(item.title, item.sub, 'Click Frame to Inspect');
  const captionMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 0.66),
    new THREE.MeshBasicMaterial({ map: captionTex, transparent: true, depthWrite: false })
  );
  captionMesh.position.set(0, 0, 0.04);
  pivotGroup.add(captionMesh);

  const dir = item.side === 'left' ? 1 : -1;
  frameMesh.userData = {
    inspectable: true,
    alignPos: { x: xPos + dir * 2.9, y: 0.25, z: item.z + 1.2 },
    lookTarget: { x: xPos, y: 0.25, z: item.z },
    stationLabel: item.title
  };

  galleryFrameObjects.push({
    group: pivotGroup,
    mesh: frameMesh,
    z: item.z,
    side: item.side,
    currentTilt: 0.35
  });
});

// Centerpiece 3D Baroque Cinema Screen at Z = -53
const cinemaGroup = new THREE.Group();
cinemaGroup.position.set(0, 0.4, -53);
scene.add(cinemaGroup);

const cinemaFrameMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.8), rectFeatheredMat.clone());
cinemaFrameMesh.userData = {
  inspectable: true,
  alignPos: { x: 0, y: 0.4, z: -48.2 },
  lookTarget: { x: 0, y: 0.4, z: -53 },
  stationLabel: 'RHIAN JADE • PRE-DEBUT FILM'
};
cinemaGroup.add(cinemaFrameMesh);

const cinemaTitleTex = createFloatingBannerTexture(
  'PRE-DEBUT FILM',
  'Rhian Jade Bianzon • Save The Date Teaser',
  '▶ Click to Watch in Full View'
);
const cinemaTitleMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(3.8, 1.15),
  new THREE.MeshBasicMaterial({ map: cinemaTitleTex, transparent: true, depthWrite: false })
);
cinemaTitleMesh.position.z = 0.05;
cinemaGroup.add(cinemaTitleMesh);

/* =========================================================================
   10. STATION IV (Z = -68): 3D ENCHANTED ROSE CLOCHE & ORBITING 18S SCROLLS
   ========================================================================= */
const programSanctuaryGroup = new THREE.Group();
programSanctuaryGroup.position.set(0, -0.1, -68);
scene.add(programSanctuaryGroup);

// Centerpiece: Feathered Enchanted Rose Cloche & Candelabras Masterpiece + Real 3D Glass Cloche
const clocheBackdropMat = createFeatheredArtworkMaterial(clocheArtTex, false);
const clocheBackdropMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 3.5), clocheBackdropMat);
clocheBackdropMesh.position.set(0, 0.55, -0.6);
programSanctuaryGroup.add(clocheBackdropMesh);

// Orbiting 3D Unfurling Parchment Scrolls Carousel around the Enchanted Rose
const scrollCarouselGroup = new THREE.Group();
scrollCarouselGroup.position.set(0, 0.25, 0);
programSanctuaryGroup.add(scrollCarouselGroup);

const programCategories = [
  {
    title: '18 ROSES',
    sub: 'The Gentlemen of the Royal Waltz',
    names: Array.from({ length: 18 }, (_, i) => `Cavalier of the Rose ${String(i + 1).padStart(2, '0')}`)
  },
  {
    title: '18 CANDLES',
    sub: 'The Ladies Lighting the Path',
    names: Array.from({ length: 18 }, (_, i) => `Bearer of Light ${String(i + 1).padStart(2, '0')}`)
  },
  {
    title: '18 TREASURES',
    sub: 'Tokens of Wisdom & Keepsakes',
    names: Array.from({ length: 18 }, (_, i) => `Royal Treasure ${String(i + 1).padStart(2, '0')}`)
  },
  {
    title: '18 BLUE BILLS',
    sub: 'Blessings of Prosperity',
    names: Array.from({ length: 18 }, (_, i) => `Patron of Prosperity ${String(i + 1).padStart(2, '0')}`)
  }
];

const scrollRadius = 3.2;
const scrollMeshes = [];

programCategories.forEach((cat, idx) => {
  const angle = (idx / programCategories.length) * Math.PI * 2;
  const singleScrollGroup = new THREE.Group();
  singleScrollGroup.position.set(Math.sin(angle) * scrollRadius, 0, Math.cos(angle) * scrollRadius);
  singleScrollGroup.rotation.y = angle;

  const scrollTex = createProgramScrollTexture(cat.title, cat.sub, cat.names);
  const parchmentPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.35, 3.25),
    new THREE.MeshBasicMaterial({ map: scrollTex, side: THREE.DoubleSide })
  );
  singleScrollGroup.add(parchmentPlane);

  // Top & Bottom 3D Sculpted 24k Gold Scroll Roller Rods & Finials
  [1.64, -1.64].forEach((rodY) => {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 2.65, 20), goldPBR);
    rod.rotation.z = Math.PI / 2;
    rod.position.y = rodY;
    singleScrollGroup.add(rod);

    [-1.38, 1.38].forEach((finX) => {
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), goldPBR);
      finial.position.set(finX, rodY, 0);
      singleScrollGroup.add(finial);
    });
  });

  parchmentPlane.userData = {
    isProgramScroll: true,
    scrollIndex: idx
  };
  scrollMeshes.push(parchmentPlane);
  scrollCarouselGroup.add(singleScrollGroup);
});

function rotateProgramCarousel(index) {
  const targetRotY = -(index / programCategories.length) * Math.PI * 2;
  gsap.to(scrollCarouselGroup.rotation, {
    y: targetRotY,
    duration: 1.25,
    ease: 'power3.out'
  });
  audio.playHoverHint();

  document.querySelectorAll('.scroll-selector-pill').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === index);
  });
}

/* =========================================================================
   11. STATION V (Z = -86): 3D DRESS CODE ORBS & ROYAL RSVP SANCTUARY
   (Inspired by MessagePaper.jsx in Kenneth's portfolio!)
   ========================================================================= */
const rsvpStationGroup = new THREE.Group();
rsvpStationGroup.position.set(0, 0.2, -86);
scene.add(rsvpStationGroup);

const attireHeaderTex = createFloatingBannerTexture(
  'ATTIRE & ROYAL RSVP',
  'Formal Evening Attire • Crimson Satin, 24k Gold & Obsidian Black',
  'Click the Royal Lectern Below to Inscribe & Wax-Seal Your Attendance'
);
const attireHeaderMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(6.8, 2.05),
  new THREE.MeshBasicMaterial({ map: attireHeaderTex, transparent: true, depthWrite: false })
);
attireHeaderMesh.position.set(0, 1.85, 0);
rsvpStationGroup.add(attireHeaderMesh);

// 3 Levitating 3D PBR Dress Code Spheres
const orbGeo = new THREE.SphereGeometry(0.58, 48, 48);
const crimsonOrbMesh = new THREE.Mesh(orbGeo, crimsonVelvetPBR);
crimsonOrbMesh.position.set(-2.1, 0.35, 0);
rsvpStationGroup.add(crimsonOrbMesh);

const goldOrbMesh = new THREE.Mesh(orbGeo, goldPBR);
goldOrbMesh.position.set(0, 0.35, 0);
rsvpStationGroup.add(goldOrbMesh);

const blackOrbMesh = new THREE.Mesh(orbGeo, obsidianMarblePBR);
blackOrbMesh.position.set(2.1, 0.35, 0);
rsvpStationGroup.add(blackOrbMesh);

[crimsonOrbMesh, goldOrbMesh, blackOrbMesh].forEach((orb) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.02, 16, 64), goldPBR);
  ring.rotation.x = Math.PI / 3;
  orb.add(ring);
});

// 3D Interactive Parchment RSVP Lectern & Brass Wax Stamp at Z = -87.5
const rsvpLecternMat = createFeatheredArtworkMaterial(parchmentCardTex, false);
const rsvpLecternMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4.1), rsvpLecternMat);
rsvpLecternMesh.position.set(0, -1.05, 1.2);
rsvpLecternMesh.rotation.x = -0.38;
rsvpLecternMesh.userData = { isRsvpLectern: true };
rsvpStationGroup.add(rsvpLecternMesh);

/* =========================================================================
   12. 3D FALLING CRIMSON ROSE PETALS & FLOATING GOLD EMBERS
   ========================================================================= */
const particleCount = 650;
const emberGeo = new THREE.BufferGeometry();
const emberPos = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  emberPos[i * 3] = (Math.random() - 0.5) * 28;
  emberPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
  emberPos[i * 3 + 2] = 28 - Math.random() * 125;
}
emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
const emberMat = new THREE.PointsMaterial({
  color: 0xffdf8e,
  size: 0.11,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending
});
const emberPoints = new THREE.Points(emberGeo, emberMat);
scene.add(emberPoints);

const petalGeo = new THREE.SphereGeometry(0.16, 10, 10);
petalGeo.scale(1.3, 0.15, 0.85);
const petals = [];
for (let i = 0; i < 75; i++) {
  const p = new THREE.Mesh(petalGeo, crimsonVelvetPBR);
  p.position.set((Math.random() - 0.5) * 18, Math.random() * 8 - 2, 26 - Math.random() * 120);
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
   13. CAMERA CONTROLLER, ENVELOPE ZOOM-THROUGH & RAYCASTER INTERACTIONS
   (Directly inspired by useInfiniteCamera.js + EntranceDoors.jsx)
   ========================================================================= */
let hasEnteredBallroom = false;
let isEnvelopeAnimating = false;
let cameraOverride = false;
let targetZ = 13.5;
let currentZ = 28;
const MIN_CORRIDOR_Z = -84;
const MAX_CORRIDOR_Z = 13.5;

const mouseNorm = { x: 0, y: 0 };
const smoothParallax = { x: 0, y: 0 };
const savedCorridorCam = { x: 0, y: 0.3, z: 13.5 };
const lookAtProxy = new THREE.Vector3(0, 0.25, 0);

const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let isEnvelopeHovered = false;

// Open 3D Envelope -> Pop Out Invitation -> Zoom Camera Right Into Envelope!
function triggerEnvelopeZoomOpen() {
  if (hasEnteredBallroom || isEnvelopeAnimating) return;
  isEnvelopeAnimating = true;
  document.body.style.cursor = 'auto';

  audio.startWaltz();
  audio.playSealChime();

  const entranceHud = document.getElementById('entrance-hud');
  if (entranceHud) entranceHud.classList.add('fade-out');

  const tl = gsap.timeline({
    onComplete: () => {
      hasEnteredBallroom = true;
      isEnvelopeAnimating = false;
      entranceGroup.visible = false;
      currentZ = 13.5;
      targetZ = 13.5;
      document.body.classList.remove('locked-at-entrance');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  });

  // 1. Gold Rose Wax Seal Spins, Lifts & Bursts with Light
  tl.to(
    waxSealGroup.rotation,
    { z: Math.PI * 1.5, duration: 0.55, ease: 'power2.inOut' },
    0
  );
  tl.to(
    waxSealGroup.position,
    { z: 1.4, y: 0.25, duration: 0.55, ease: 'back.in(1.4)' },
    0
  );
  tl.to(
    waxSealGroup.scale,
    { x: 0.01, y: 0.01, z: 0.01, duration: 0.25, ease: 'power2.in' },
    0.45
  );

  // 2. Top Envelope Flap Rotates Open in 3D
  tl.to(
    topFlapPivot.rotation,
    { x: -Math.PI * 0.85, duration: 0.85, ease: 'power3.inOut' },
    0.25
  );

  // 3. Inner Parchment Invitation Card ("Rhian Jade Bianzon • January 9, 2027") Rises Out & Glows
  tl.to(
    innerLetterMesh.position,
    { y: 0.52, z: 0.28, duration: 0.95, ease: 'power3.out' },
    0.45
  );
  tl.to(
    innerLetterMesh.scale,
    { x: 1.06, y: 1.06, z: 1.06, duration: 0.95, ease: 'power3.out' },
    0.45
  );

  // Pause briefly so the guest admires the risen invitation letter, then ZOOM THROUGH IT!
  // 4. Envelope Pockets & Velvet Curtains Part Wide while Camera Zooms Inside the Envelope
  tl.to(
    leftPocketFlap.position,
    { x: -4.2, duration: 1.1, ease: 'power2.inOut' },
    1.35
  );
  tl.to(
    rightPocketFlap.position,
    { x: 4.2, duration: 1.1, ease: 'power2.inOut' },
    1.35
  );
  tl.to(
    leftEntranceCurtain.position,
    { x: -5.8, duration: 1.4, ease: 'power3.inOut' },
    1.3
  );
  tl.to(
    rightEntranceCurtain.position,
    { x: 5.8, duration: 1.4, ease: 'power3.inOut' },
    1.3
  );
  tl.to(
    innerLetterMesh.scale,
    { x: 3.4, y: 3.4, z: 3.4, duration: 1.25, ease: 'power2.in' },
    1.4
  );
  tl.to(
    innerLetterMesh.material,
    { opacity: 0, duration: 0.65, ease: 'power2.in' },
    1.85
  );

  // Camera physically zooms INTO the opened envelope (Z=28 -> Z=22 -> Z=13.5)
  tl.to(
    camera.position,
    { z: 13.5, y: 0.3, duration: 1.65, ease: 'power3.inOut' },
    1.25
  );
}

// Inspect any 3D Portrait / Cinema Frame (DoorSection.jsx camera align pattern)
function inspect3DFrame(userData) {
  if (cameraOverride) return;
  cameraOverride = true;
  document.body.classList.add('inspecting-frame');
  document.getElementById('back-to-corridor-btn').classList.remove('hidden');
  document.getElementById('current-station-label').textContent = userData.stationLabel || 'PORTRAIT INSPECTION';

  savedCorridorCam.x = camera.position.x;
  savedCorridorCam.y = camera.position.y;
  savedCorridorCam.z = camera.position.z;

  audio.playSealChime([329.63, 440.0, 554.37, 659.25]);

  gsap.to(camera.position, {
    x: userData.alignPos.x,
    y: userData.alignPos.y,
    z: userData.alignPos.z,
    duration: 1.25,
    ease: 'power3.inOut'
  });
  gsap.to(lookAtProxy, {
    x: userData.lookTarget.x,
    y: userData.lookTarget.y,
    z: userData.lookTarget.z,
    duration: 1.25,
    ease: 'power3.inOut'
  });
}

function exitFrameInspection() {
  if (!cameraOverride) return;
  audio.playHoverHint();
  document.getElementById('back-to-corridor-btn').classList.add('hidden');
  document.body.classList.remove('inspecting-frame');

  gsap.to(camera.position, {
    x: savedCorridorCam.x,
    y: savedCorridorCam.y,
    z: savedCorridorCam.z,
    duration: 1.15,
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
    duration: 1.15,
    ease: 'power3.inOut'
  });
}

document.getElementById('back-to-corridor-btn').addEventListener('click', exitFrameInspection);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cameraOverride) {
    exitFrameInspection();
  }
});

// Pointer Move: Mouse Parallax + Raycast Hover Hints
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
        gsap.to(topFlapPivot.rotation, { x: -0.18, duration: 0.35, ease: 'power2.out' });
        gsap.to(waxSealGroup.scale, { x: 1.12, y: 1.12, z: 1.12, duration: 0.35, ease: 'back.out(1.7)' });
      }
    } else if (isEnvelopeHovered) {
      isEnvelopeHovered = false;
      document.body.style.cursor = 'auto';
      gsap.to(topFlapPivot.rotation, { x: 0, duration: 0.35, ease: 'power2.out' });
      gsap.to(waxSealGroup.scale, { x: 1, y: 1, z: 1, duration: 0.35, ease: 'power2.out' });
    }
    return;
  }

  if (hasEnteredBallroom && !cameraOverride) {
    const interactiveMeshes = [
      heroOvalMesh,
      cinemaFrameMesh,
      rsvpLecternMesh,
      ...galleryFrameObjects.map((g) => g.mesh),
      ...scrollMeshes
    ];
    const hits = raycaster.intersectObjects(interactiveMeshes, false);
    document.body.style.cursor = hits.length > 0 ? 'pointer' : 'auto';
  }
});

// Pointer Click: Open Envelope OR Inspect 3D Frame / Rotate 3D Scroll / Open RSVP
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
      heroOvalMesh,
      cinemaFrameMesh,
      rsvpLecternMesh,
      ...galleryFrameObjects.map((g) => g.mesh),
      ...scrollMeshes
    ];
    const hits = raycaster.intersectObjects(interactiveMeshes, false);
    if (hits.length > 0) {
      const hitObj = hits[0].object;
      if (hitObj.userData.inspectable) {
        inspect3DFrame(hitObj.userData);
      } else if (hitObj.userData.isProgramScroll) {
        rotateProgramCarousel(hitObj.userData.scrollIndex);
      } else if (hitObj.userData.isRsvpLectern) {
        openModalDialog(document.getElementById('rsvp-modal'));
      }
    }
  }
});

// Sync Virtual Window Scroll with 3D Camera Z Position
window.addEventListener('scroll', () => {
  if (!hasEnteredBallroom || cameraOverride) return;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  targetZ = MAX_CORRIDOR_Z - progress * (MAX_CORRIDOR_Z - MIN_CORRIDOR_Z);

  // Scroll Progress Fallback for browsers without CSS `animation-timeline: scroll()`
  if (!CSS.supports('animation-timeline', 'scroll()')) {
    const progEl = document.getElementById('progress');
    if (progEl) progEl.style.transform = `scaleX(${progress})`;
  }
});

/* =========================================================================
   14. PORTFOLIO-STYLE NAVIGATION HUD, TELEPORT CURTAIN & MODALS
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

// Velvet Curtain Teleport Transition to Any Z-Station (Inspired by PaperTransition.jsx)
const curtainEl = document.getElementById('curtain-transition');
const leftWing = curtainEl.querySelector('.curtain-wing.left');
const rightWing = curtainEl.querySelector('.curtain-wing.right');
const curtainCrest = curtainEl.querySelector('.curtain-crest');

function teleportToZ(destinationZ) {
  mapPanel.classList.remove('open');
  if (cameraOverride) exitFrameInspection();

  const progress = (MAX_CORRIDOR_Z - destinationZ) / (MAX_CORRIDOR_Z - MIN_CORRIDOR_Z);
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

  curtainEl.style.display = 'block';
  gsap.set(leftWing, { xPercent: -100 });
  gsap.set(rightWing, { xPercent: 100 });
  gsap.set(curtainCrest, { opacity: 0, scale: 0.85 });

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
    window.scrollTo({ top: progress * maxScroll, behavior: 'instant' });
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

// Replay Envelope Opening Button
document.getElementById('replay-envelope-btn').addEventListener('click', () => {
  mapPanel.classList.remove('open');
  if (cameraOverride) exitFrameInspection();
  hasEnteredBallroom = false;
  isEnvelopeAnimating = false;
  document.body.classList.add('locked-at-entrance');
  document.getElementById('entrance-hud').classList.remove('fade-out');

  entranceGroup.visible = true;
  waxSealGroup.position.set(0, -0.05, 0.18);
  waxSealGroup.rotation.set(0, 0, 0);
  waxSealGroup.scale.set(1, 1, 1);
  topFlapPivot.rotation.set(0, 0, 0);
  innerLetterMesh.position.set(0, -0.08, 0.06);
  innerLetterMesh.scale.setScalar(0.88);
  innerLetterMesh.material.opacity = 1;
  leftPocketFlap.position.set(-ENV_W * 0.25, 0, 0.09);
  rightPocketFlap.position.set(ENV_W * 0.25, 0, 0.09);
  leftEntranceCurtain.position.set(-2.35, 0.4, -0.8);
  rightEntranceCurtain.position.set(2.35, 0.4, -0.8);
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

// 18th Program Bottom Selector Pills
document.querySelectorAll('.scroll-selector-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    const idx = parseInt(pill.dataset.scrollIndex, 10);
    rotateProgramCarousel(idx);
  });
});

// Light-Dismiss Native <dialog> Modals + Mandatory Safari Fallback (`light-dismiss-a-dialog`)
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

// Draw Ornate Golden QR Emblem in Venue Modal
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
const stationLabelEl = document.getElementById('current-station-label');
const ctxLocation = document.getElementById('context-location');
const ctxProgram = document.getElementById('context-program');
const ctxRsvp = document.getElementById('context-rsvp');

function updateStationHUD(z) {
  ctxLocation.classList.toggle('hidden', !(z < -5 && z > -22));
  ctxProgram.classList.toggle('hidden', !(z < -56 && z > -76));
  ctxRsvp.classList.toggle('hidden', !(z <= -76));

  if (z > -4) {
    stationLabelEl.textContent = 'I • RHIAN JADE BIANZON';
  } else if (z > -22) {
    stationLabelEl.textContent = 'II • JANUARY 9, 2027 COUNTDOWN';
  } else if (z > -56) {
    stationLabelEl.textContent = 'III • THE ROYAL GALLERY';
  } else if (z > -76) {
    stationLabelEl.textContent = 'IV • THE EIGHTEENTH PROGRAM';
  } else {
    stationLabelEl.textContent = 'V • ATTIRE & ROYAL RSVP';
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  // Smooth Mouse Parallax
  smoothParallax.x = THREE.MathUtils.lerp(smoothParallax.x, mouseNorm.x * 0.42, 0.05);
  smoothParallax.y = THREE.MathUtils.lerp(smoothParallax.y, mouseNorm.y * 0.24, 0.05);

  if (!hasEnteredBallroom && !isEnvelopeAnimating) {
    // Subtle floating motion on the 3D Envelope at the Entrance
    envelope3DGroup.position.y = Math.sin(time * 1.4) * 0.06;
    envelope3DGroup.rotation.y = smoothParallax.x * 0.35;
    envelope3DGroup.rotation.x = -smoothParallax.y * 0.25;
    camera.position.x = smoothParallax.x * 0.35;
    camera.position.y = 0.3 + smoothParallax.y * 0.25;
    camera.lookAt(0, 0.25, ENTRANCE_Z);
  } else if (hasEnteredBallroom && !cameraOverride) {
    // Smooth Z-Axis Corridor Movement (useInfiniteCamera pattern)
    currentZ = THREE.MathUtils.lerp(currentZ, targetZ, 0.055);

    // Auto-Glance toward nearby Gallery Portrait Frames
    let glanceX = 0;
    galleryFrameObjects.forEach((f) => {
      const dist = currentZ - f.z;
      if (dist > -2 && dist < 12) {
        const strength = Math.sin(((dist + 2) / 14) * Math.PI);
        glanceX += (f.side === 'left' ? -1 : 1) * strength * 0.65;
      }
    });

    camera.position.z = currentZ;
    camera.position.x = smoothParallax.x;
    camera.position.y = 0.3 + smoothParallax.y;

    lookAtProxy.set(smoothParallax.x * 0.4 + glanceX, 0.25 + smoothParallax.y * 0.5, currentZ - 10);
    camera.lookAt(lookAtProxy);
    updateStationHUD(currentZ);
  } else if (cameraOverride) {
    camera.lookAt(lookAtProxy);
  }

  // Hero Split-Letter Animation ("RHIAN JADE" splits apart as camera approaches Z = 6.5!)
  const distToHeroText = camera.position.z - HERO_TEXT_Z;
  let splitTarget = 0;
  if (distToHeroText < 5.5 && distToHeroText > -2.5) {
    const norm = 1 - Math.abs(distToHeroText - 1.2) / 4.3;
    splitTarget = Math.max(0, norm) * 2.6;
  }

  heroLetterMeshes.forEach((m) => {
    const targetX = m.userData.baseX + m.userData.splitDir * splitTarget;
    m.position.x = THREE.MathUtils.lerp(m.position.x, targetX, 0.08);
    m.position.y = Math.sin(time * 1.2 + m.userData.idx * 0.4) * 0.04;
  });

  // Dynamic Proximity Tilt on Sawtooth Gallery Frames (DoorSection.jsx pattern)
  galleryFrameObjects.forEach((item) => {
    const d = Math.abs(camera.position.z - item.z);
    const targetAngle = d < 12 ? 0.42 : 0.95;
    item.currentTilt = THREE.MathUtils.lerp(item.currentTilt, targetAngle, 0.06);
    item.group.rotation.y = item.side === 'left' ? item.currentTilt : -item.currentTilt;
  });

  // Animate 3D Dress Code Spheres
  crimsonOrbMesh.rotation.y = time * 0.5;
  goldOrbMesh.rotation.y = -time * 0.6;
  blackOrbMesh.rotation.y = time * 0.45;

  // Flicker Hanging Lanterns & Float Gold Dust / Falling Rose Petals
  lanternFlames.forEach((fl, idx) => {
    const s = 0.9 + Math.sin(time * 6 + idx) * 0.15;
    fl.scale.setScalar(s);
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
