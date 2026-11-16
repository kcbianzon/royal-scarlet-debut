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
   2. TRUE SILHOUETTE ALPHA-CUTOUT SHADERS (100% Full Artwork Brightness,
      Zero Darkening, and Zero Rectangular Background Boxes!)
   ========================================================================= */

/**
 * Cuts out the outer dark background of `baroque_parchment_card.jpg` or `baroque_rect_frame.jpg`
 * while keeping 100% of the carved 24k gold filigree, crown crest, and roses AND keeping
 * the inner parchment/mirror area (`innerBox`) 100% opaque!
 */
function createBaroqueCutoutMaterial(texture, innerBox = { xMin: 0.24, xMax: 0.76, yMin: 0.23, yMax: 0.77 }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: texture },
      uInner: { value: new THREE.Vector4(innerBox.xMin, innerBox.xMax, innerBox.yMin, innerBox.yMax) },
      uOpacity: { value: 1.0 }
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
      uniform vec4 uInner;
      uniform float uOpacity;
      varying vec2 vUv;

      void main() {
        vec4 tex = texture2D(uMap, vUv);

        // Check if pixel is inside the inner parchment/mirror rectangle
        bool insideInner = (vUv.x >= uInner.x && vUv.x <= uInner.y && vUv.y >= uInner.z && vUv.y <= uInner.w);

        // Brightness & Gold/Crimson chroma detection for the carved Baroque frame outside the inner area
        float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
        float redDominance = max(0.0, tex.r - tex.g * 0.65);
        float frameSignal = max(luma, redDominance * 0.95);

        // Smoothly fade near the extreme outer 3% perimeter so no hard edge can ever appear
        vec2 edgeDist = min(vUv, 1.0 - vUv);
        float borderFade = smoothstep(0.0, 0.04, min(edgeDist.x, edgeDist.y));

        // Outside the inner area, key out the dark background so ONLY the carved gold filigree & crimson roses remain!
        float cutoutAlpha = insideInner ? 1.0 : smoothstep(0.08, 0.22, frameSignal);

        gl_FragColor = vec4(tex.rgb, tex.a * cutoutAlpha * borderFade * uOpacity);
      }
    `
  });
}

/**
 * Cuts out the outer background around the carved 24k Baroque Oval Frame (`baroque_oval_frame.jpg`)
 * while preserving the top royal crown, cherubs, carved gold oval, and bottom rose garland!
 */
function createOvalMasterpieceCutoutMaterial(texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: texture }
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
      varying vec2 vUv;

      void main() {
        vec4 tex = texture2D(uMap, vUv);
        vec2 c = (vUv - vec2(0.5, 0.49)) / vec2(0.21, 0.23);
        bool insideMirrorOval = dot(c, c) <= 1.0;

        // Exclude the side curtains of baroque_oval_frame.jpg (x < 0.16 or x > 0.84) so only the oval frame, crown & roses remain!
        float horizontalMask = smoothstep(0.14, 0.23, vUv.x) * (1.0 - smoothstep(0.77, 0.86, vUv.x));
        float verticalMask = smoothstep(0.02, 0.07, vUv.y) * (1.0 - smoothstep(0.93, 0.98, vUv.y));

        float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
        float redSignal = max(0.0, tex.r - tex.b * 1.2);
        float signal = max(luma, redSignal);

        float alpha = insideMirrorOval ? 1.0 : (smoothstep(0.11, 0.24, signal) * horizontalMask * verticalMask);
        gl_FragColor = vec4(tex.rgb, alpha);
      }
    `
  });
}

/**
 * Cuts out the black background around the Enchanted Rose Cloche & Lit Golden Candelabras (`enchanted_rose_cloche.jpg`)
 */
function createClocheCutoutMaterial(texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: texture }
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
      varying vec2 vUv;

      void main() {
        vec4 tex = texture2D(uMap, vUv);
        float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
        float redSignal = max(0.0, tex.r - tex.g * 0.5);
        float signal = max(luma, redSignal);

        vec2 edge = min(vUv, 1.0 - vUv);
        float edgeFade = smoothstep(0.0, 0.05, min(edge.x, edge.y));
        float alpha = smoothstep(0.05, 0.18, signal) * edgeFade;

        gl_FragColor = vec4(tex.rgb, alpha);
      }
    `
  });
}

/* =========================================================================
   3. COMPOSITED BAROQUE PARCHMENT & SMOKED-MIRROR TEXTURE GENERATORS
      Draws crisp typography directly onto the inner parchment/mirror of our
      museum-grade `baroque_parchment_card.jpg` & `baroque_rect_frame.jpg`!
   ========================================================================= */
function createCompositedParchmentCardTexture(baseImg, drawContentFn) {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  function render() {
    ctx.clearRect(0, 0, 900, 1200);
    if (baseImg && baseImg.complete && baseImg.naturalWidth > 0) {
      ctx.drawImage(baseImg, 0, 0, 900, 1200);
    }
    // Inner blank cream parchment area of baroque_parchment_card.jpg:
    // X: 230..670 (width 440), Y: 295..915 (height 620)
    drawContentFn(ctx);
    tex.needsUpdate = true;
  }

  render();
  return { tex, render };
}

function createCompositedRectFrameTexture(baseImg, drawContentFn) {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  function render() {
    ctx.clearRect(0, 0, 960, 720);
    if (baseImg && baseImg.complete && baseImg.naturalWidth > 0) {
      ctx.drawImage(baseImg, 0, 0, 960, 720);
    }
    // Inner smoked mirror area of baroque_rect_frame.jpg:
    // X: 196..764, Y: 184..532
    drawContentFn(ctx);
    tex.needsUpdate = true;
  }

  render();
  return { tex, render };
}

function createCharTexture(char, color = '#f7e49e', fontSize = 155) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 256, 256);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 18;
  ctx.font = `700 ${fontSize}px "Cinzel Decorative", Cinzel, serif`;

  const grad = ctx.createLinearGradient(0, 36, 0, 220);
  grad.addColorStop(0, '#fff9df');
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, '#9b7219');
  ctx.fillStyle = grad;
  ctx.fillText(char, 128, 132);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createFloatingBannerTexture(title, subtitle, detail = '') {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 1400, 400);
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.98)';
  ctx.shadowBlur = 24;

  const grad = ctx.createLinearGradient(0, 70, 0, 210);
  grad.addColorStop(0, '#fff9e2');
  grad.addColorStop(0.55, '#f5e29c');
  grad.addColorStop(1, '#d4af37');
  ctx.fillStyle = grad;
  ctx.font = '700 68px "Cinzel Decorative", Cinzel, serif';
  ctx.fillText(title, 700, 160);

  ctx.fillStyle = '#faefd7';
  ctx.font = '600 32px Cinzel, serif';
  ctx.fillText(subtitle, 700, 238);

  if (detail) {
    ctx.fillStyle = '#f7e49e';
    ctx.font = 'italic 38px "Cormorant Garamond", serif';
    ctx.fillText(detail, 700, 308);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* =========================================================================
   4. MAIN THREE.JS WORLD SETUP (`#webgl-canvas`)
   ========================================================================= */
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070203);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 160);
camera.position.set(0, 0.25, 28);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

let responsiveScale = 1.0;
function updateResponsiveCamera() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / Math.max(1, h);

  camera.aspect = aspect;
  camera.fov = aspect < 0.75 ? 74 : aspect < 1.0 ? 66 : 58;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);

  responsiveScale = aspect < 0.75 ? 0.68 : aspect < 1.0 ? 0.82 : 1.0;
}

const texLoader = new THREE.TextureLoader();
const compositeRenders = [];

function loadImageWithCallback(url, onDone) {
  const tex = texLoader.load(url, () => {
    onDone?.(tex.image);
    compositeRenders.forEach((fn) => fn());
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const ballroomVistaTex = loadImageWithCallback('./assets/royal_ballroom_bg.jpg');
const curtainStageTex = loadImageWithCallback('./assets/royal_curtain_backdrop.jpg');
const envelopeTex = loadImageWithCallback('./assets/royal_envelope_closed.jpg');
const ovalFrameTex = loadImageWithCallback('./assets/baroque_oval_frame.jpg');
const rectFrameTex = loadImageWithCallback('./assets/baroque_rect_frame.jpg');
const parchmentCardTex = loadImageWithCallback('./assets/baroque_parchment_card.jpg');
const clocheArtTex = loadImageWithCallback('./assets/enchanted_rose_cloche.jpg');

/* =========================================================================
   5. BRIGHT, OPULENT 3D ROYAL PALACE BALLROOM ENVIRONMENT
      (Uses `royal_ballroom_bg.jpg` at full vibrancy — No dark black polygons!)
   ========================================================================= */
const ballroomEnvironment = new THREE.Group();
scene.add(ballroomEnvironment);

// Far Palace Ballroom Horizon Vista that glides smoothly ahead of the camera
// and zooms subtly as you walk down the corridor!
const ballroomVistaMat = new THREE.ShaderMaterial({
  uniforms: {
    uMap: { value: ballroomVistaTex },
    uWalkProgress: { value: 0.0 }
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
    varying vec2 vUv;

    void main() {
      // Subtle repeating zoom cycle so you feel like you are walking deeper and deeper through the palace ballroom!
      float cycle = fract(uWalkProgress * 2.5);
      float zoom1 = 1.0 + cycle * 0.45;
      float zoom2 = 1.0 + fract((uWalkProgress * 2.5) + 0.5) * 0.45;

      vec2 uv1 = (vUv - 0.5) / zoom1 + 0.5;
      vec2 uv2 = (vUv - 0.5) / zoom2 + 0.5;

      vec4 col1 = texture2D(uMap, uv1);
      vec4 col2 = texture2D(uMap, uv2);
      float blend = abs(cycle * 2.0 - 1.0);
      vec4 col = mix(col1, col2, 1.0 - blend);

      // Gentle vignette so foreground 24k gold Baroque cutouts shine clearly
      float d = length((vUv - 0.5) * vec2(1.1, 1.0));
      float vig = 1.0 - smoothstep(0.4, 1.05, d) * 0.42;

      gl_FragColor = vec4(col.rgb * 0.78 * vig, 1.0);
    }
  `
});

const farBallroomMesh = new THREE.Mesh(new THREE.PlaneGeometry(42, 24), ballroomVistaMat);
farBallroomMesh.position.set(0, 0.25, -18);
scene.add(farBallroomMesh);

// 3D Ballroom Arched Wing Portals along the Z-Corridor (You physically walk through each bay!)
const portalWingMat = new THREE.ShaderMaterial({
  uniforms: {
    uMap: { value: ballroomVistaTex }
  },
  transparent: true,
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
    varying vec2 vUv;
    void main() {
      vec4 tex = texture2D(uMap, vUv);
      // Open arched doorway in the center so the camera walks right through each palace bay
      vec2 archCoord = (vUv - vec2(0.5, 0.44)) / vec2(0.32, 0.42);
      float centerHole = smoothstep(0.75, 1.15, length(archCoord));
      vec2 edge = min(vUv, 1.0 - vUv);
      float outerSoft = smoothstep(0.0, 0.08, min(edge.x, edge.y));
      gl_FragColor = vec4(tex.rgb * 0.85, centerHole * outerSoft * 0.72);
    }
  `
});

for (let z = 6; z >= -102; z -= 14) {
  const portalMesh = new THREE.Mesh(new THREE.PlaneGeometry(24, 13.5), portalWingMat);
  portalMesh.position.set(0, 0.25, z);
  ballroomEnvironment.add(portalMesh);
}

/* =========================================================================
   6. STAGE 0 (Z = 22): SEAMLESS OPERA CURTAIN STAGE & EXQUISITE 3D ENVELOPE
      - Zero middle curtain seam (Left half uses U: 0..0.5, Right half uses U: 0.5..1.0)!
      - 100% Unlit Full Brightness (`MeshBasicMaterial`) so the envelope looks
        exactly as rich and golden as the original render!
      - Hovering pulses the Gold Rose Wax Seal without tilting the envelope like a card!
   ========================================================================= */
const ENTRANCE_Z = 22;
const entranceGroup = new THREE.Group();
entranceGroup.position.set(0, 0.25, ENTRANCE_Z);
scene.add(entranceGroup);

// Seamless Left & Right Opera Stage Curtain Halves (`u: 0..0.5` and `u: 0.5..1.0`)
const leftCurtainTex = curtainStageTex.clone();
leftCurtainTex.needsUpdate = true;
leftCurtainTex.repeat.set(0.5, 1.0);
leftCurtainTex.offset.set(0.0, 0.0);

const rightCurtainTex = curtainStageTex.clone();
rightCurtainTex.needsUpdate = true;
rightCurtainTex.repeat.set(0.5, 1.0);
rightCurtainTex.offset.set(0.5, 0.0);

const STAGE_W = 19.2;
const STAGE_H = 10.8;

const leftStageCurtain = new THREE.Mesh(
  new THREE.PlaneGeometry(STAGE_W / 2, STAGE_H),
  new THREE.MeshBasicMaterial({ map: leftCurtainTex })
);
leftStageCurtain.position.set(-STAGE_W / 4, 0, -0.8);
entranceGroup.add(leftStageCurtain);

const rightStageCurtain = new THREE.Mesh(
  new THREE.PlaneGeometry(STAGE_W / 2, STAGE_H),
  new THREE.MeshBasicMaterial({ map: rightCurtainTex })
);
rightStageCurtain.position.set(STAGE_W / 4, 0, -0.8);
entranceGroup.add(rightStageCurtain);

// Exquisite Cropped Envelope (U: 0.184..0.816, V: 0.205..0.795 — ZERO outer marble/candles!)
const envelopeGroup = new THREE.Group();
entranceGroup.add(envelopeGroup);

const croppedEnvMat = new THREE.ShaderMaterial({
  uniforms: {
    uMap: { value: envelopeTex },
    uOpacity: { value: 1.0 }
  },
  transparent: true,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uMap;
    uniform float uOpacity;
    varying vec2 vUv;
    void main() {
      // Map ONLY the exact gold-filigree velvet envelope rectangle (u: 0.186..0.814, v: 0.208..0.792)
      vec2 envUv = vec2(mix(0.186, 0.814, vUv.x), mix(0.208, 0.792, vUv.y));
      vec4 tex = texture2D(uMap, envUv);

      // Softly feather the extreme 1.5% edge so it sits naturally in 3D space
      vec2 d = min(vUv, 1.0 - vUv);
      float edgeAlpha = smoothstep(0.0, 0.018, min(d.x, d.y));
      gl_FragColor = vec4(tex.rgb, edgeAlpha * uOpacity);
    }
  `
});

const ENV_W = 4.5;
const ENV_H = 3.1;
const envBodyMesh = new THREE.Mesh(new THREE.PlaneGeometry(ENV_W, ENV_H), croppedEnvMat);
envelopeGroup.add(envBodyMesh);

// Separate Interactive Gold Rose Wax Seal Mesh Centered over the Seal (Rotates & glows on hover!)
const sealCutoutMat = new THREE.ShaderMaterial({
  uniforms: {
    uMap: { value: envelopeTex },
    uGlow: { value: 0.0 }
  },
  transparent: true,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uMap;
    uniform float uGlow;
    varying vec2 vUv;
    void main() {
      vec2 sealUv = vec2(mix(0.415, 0.585, vUv.x), mix(0.385, 0.605, vUv.y));
      vec4 tex = texture2D(uMap, sealUv);
      float dist = length((vUv - 0.5) * 2.0);
      float circleMask = 1.0 - smoothstep(0.88, 1.0, dist);
      vec3 boosted = tex.rgb + vec3(0.95, 0.82, 0.35) * uGlow * (1.0 - dist * 0.5);
      gl_FragColor = vec4(boosted, circleMask);
    }
  `
});

const waxSealMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 1.08), sealCutoutMat);
waxSealMesh.position.set(0, -0.02, 0.04);
envelopeGroup.add(waxSealMesh);

// Glowing Golden Ring around the Wax Seal (Pulses gently to invite click)
const sealRingMesh = new THREE.Mesh(
  new THREE.RingGeometry(0.55, 0.58, 64),
  new THREE.MeshBasicMaterial({ color: 0xf7e49e, transparent: true, opacity: 0.65, side: THREE.DoubleSide })
);
sealRingMesh.position.set(0, -0.02, 0.05);
envelopeGroup.add(sealRingMesh);

// Pop-Out Carved 24k Baroque Gold & Parchment Invitation Card (True Silhouette Cutout!)
const popoutCardComposite = createCompositedParchmentCardTexture(parchmentCardTex.image, (ctx) => {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7a5410';
  ctx.font = 'bold 28px Cinzel, serif';
  ctx.fillText('⚜ 👑 ⚜', 450, 360);

  ctx.fillStyle = '#6e0515';
  ctx.font = 'italic 34px "Cormorant Garamond", serif';
  ctx.fillText('You are cordially invited', 450, 415);
  ctx.fillText('to the debut celebration of', 450, 452);

  ctx.fillStyle = '#8b0018';
  ctx.font = '500 72px "Great Vibes", cursive';
  ctx.fillText('Rhian Jade', 450, 545);

  ctx.fillStyle = '#4a040d';
  ctx.font = 'bold 34px Cinzel, serif';
  ctx.fillText('B I A N Z O N', 450, 595);

  ctx.strokeStyle = 'rgba(138, 100, 21, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(280, 625);
  ctx.lineTo(620, 625);
  ctx.stroke();

  ctx.fillStyle = '#4a040d';
  ctx.font = '600 24px Cinzel, serif';
  ctx.fillText('A DECADE AND EIGHT', 450, 668);

  ctx.fillStyle = '#8b0018';
  ctx.font = 'bold 42px Cinzel, serif';
  ctx.fillText('JANUARY 9, 2027', 450, 745);

  ctx.fillStyle = '#4a040d';
  ctx.font = '600 21px Cinzel, serif';
  ctx.fillText('SATURDAY • 5:00 PM', 450, 790);

  ctx.fillStyle = '#6e0515';
  ctx.font = 'italic 28px "Cormorant Garamond", serif';
  ctx.fillText('The Grand Royal Ballroom', 450, 855);
});
compositeRenders.push(popoutCardComposite.render);

const popoutCardMat = createBaroqueCutoutMaterial(popoutCardComposite.tex);
const popoutCardMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 4.65), popoutCardMat);
popoutCardMesh.position.set(0, -0.3, 0.08);
popoutCardMesh.scale.setScalar(0.5);
popoutCardMesh.visible = false;
envelopeGroup.add(popoutCardMesh);

/* =========================================================================
   7. STATION I (Z = 6.5 & Z = 1.2): SPLIT-LETTER 3D HERO ("RHIAN JADE")
      & CARVED BAROQUE OVAL PORTRAIT CUTOUT
   ========================================================================= */
const heroStationGroup = new THREE.Group();
scene.add(heroStationGroup);

const HERO_TEXT_Z = 6.5;
const splitLettersGroup = new THREE.Group();
splitLettersGroup.position.set(0, 0.9, HERO_TEXT_Z);
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
  new THREE.PlaneGeometry(5.6, 1.6),
  new THREE.MeshBasicMaterial({ map: heroSubBannerTex, transparent: true, depthWrite: false })
);
heroSubBannerMesh.position.set(0, -0.5, HERO_TEXT_Z);
heroStationGroup.add(heroSubBannerMesh);

// Carved 24k Baroque Oval Mirror with True Silhouette Cutout (No Rectangular Curtain Edges!)
const heroOvalCutoutMat = createOvalMasterpieceCutoutMaterial(ovalFrameTex);
const heroOvalMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 5.5), heroOvalCutoutMat);
heroOvalMesh.position.set(0, 0.35, 1.2);
heroOvalMesh.userData = {
  inspectable: true,
  alignPos: { x: 0, y: 0.35, z: 5.0 },
  lookTarget: { x: 0, y: 0.35, z: 1.2 }
};
heroStationGroup.add(heroOvalMesh);

const ovalInscriptTex = createFloatingBannerTexture('Rhian Jade', 'EIGHTEENTH DEBUT', '01 . 09 . 2027');
const ovalInscriptMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1.95, 0.58),
  new THREE.MeshBasicMaterial({ map: ovalInscriptTex, transparent: true, depthWrite: false })
);
ovalInscriptMesh.position.set(0, 0.32, 1.24);
heroStationGroup.add(ovalInscriptMesh);

/* =========================================================================
   8. STATION II (Z = -12): LIVE 3D COUNTDOWN TO JANUARY 9, 2027
      Rendered inside 4 Silhouette-Cutout Carved 24k Baroque Gold Frames!
   ========================================================================= */
const countdownStationGroup = new THREE.Group();
countdownStationGroup.position.set(0, 0.25, -12);
scene.add(countdownStationGroup);

const cdHeaderTex = createFloatingBannerTexture(
  'THE ROYAL COUNTDOWN',
  'Saturday, January 9, 2027 • Five O’Clock in the Evening',
  'The Grand Royal Ballroom'
);
const cdHeaderMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(6.2, 1.75),
  new THREE.MeshBasicMaterial({ map: cdHeaderTex, transparent: true, depthWrite: false })
);
cdHeaderMesh.position.set(0, 1.75, 0);
countdownStationGroup.add(cdHeaderMesh);

const cdUnits = [
  { key: 'days', label: 'DAYS', x: -2.55 },
  { key: 'hours', label: 'HOURS', x: -0.85 },
  { key: 'mins', label: 'MINUTES', x: 0.85 },
  { key: 'secs', label: 'SECONDS', x: 2.55 }
];

const cdState = { days: '00', hours: '00', mins: '00', secs: '00' };
const cdUnitRenders = [];

cdUnits.forEach((u) => {
  const comp = createCompositedRectFrameTexture(rectFrameTex.image, (ctx) => {
    ctx.textAlign = 'center';
    const grad = ctx.createLinearGradient(0, 240, 0, 410);
    grad.addColorStop(0, '#fff9df');
    grad.addColorStop(0.55, '#d4af37');
    grad.addColorStop(1, '#8c6414');
    ctx.fillStyle = grad;
    ctx.font = 'bold 145px Cinzel, serif';
    ctx.fillText(cdState[u.key], 480, 385);

    ctx.fillStyle = '#faefd7';
    ctx.font = '600 36px Cinzel, serif';
    ctx.fillText(u.label, 480, 465);
  });
  compositeRenders.push(comp.render);
  cdUnitRenders.push(comp.render);

  const mat = createBaroqueCutoutMaterial(comp.tex, { xMin: 0.2, xMax: 0.8, yMin: 0.25, yMax: 0.74 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 1.24), mat);
  mesh.position.set(u.x, -0.15, 0);
  countdownStationGroup.add(mesh);
});

function tickCountdown() {
  const now = Date.now();
  const target = new Date(DEBUT_DATE_ISO).getTime();
  const diff = Math.max(0, Math.floor((target - now) / 1000));

  cdState.days = String(Math.floor(diff / 86400)).padStart(2, '0');
  cdState.hours = String(Math.floor((diff % 86400) / 3600)).padStart(2, '0');
  cdState.mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
  cdState.secs = String(diff % 60).padStart(2, '0');

  cdUnitRenders.forEach((fn) => fn());
}

tickCountdown();
setInterval(tickCountdown, 1000);

/* =========================================================================
   9. STATION III (Z = -24 to Z = -46): SILHOUETTE-CUTOUT BAROQUE PORTRAIT
      CORRIDOR & CINEMA SCREEN (Sawtooth Tilt + Click-to-Inspect!)
   ========================================================================= */
const galleryDefs = [
  { z: -24, side: 'left', roman: 'I', title: 'ROYAL PORTRAIT I', sub: 'Rhian Jade • Pre-Debut Collection' },
  { z: -30, side: 'right', roman: 'II', title: 'ROYAL PORTRAIT II', sub: '24k Gold Couture' },
  { z: -36, side: 'left', roman: 'III', title: 'ROYAL PORTRAIT III', sub: 'Midnight Velvet Series' },
  { z: -42, side: 'right', roman: 'IV', title: 'ROYAL PORTRAIT IV', sub: 'Candlelight Elegance' }
];

const galleryFrameObjects = [];

galleryDefs.forEach((item) => {
  const xPos = item.side === 'left' ? -2.9 : 2.9;
  const comp = createCompositedRectFrameTexture(rectFrameTex.image, (ctx) => {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 58px "Cinzel Decorative", Cinzel, serif';
    ctx.fillText(`♛ ${item.roman} ♛`, 480, 315);

    ctx.fillStyle = '#faefd7';
    ctx.font = 'bold 42px Cinzel, serif';
    ctx.fillText(item.title, 480, 395);

    ctx.fillStyle = '#f7e49e';
    ctx.font = 'italic 36px "Cormorant Garamond", serif';
    ctx.fillText(item.sub, 480, 455);
  });
  compositeRenders.push(comp.render);

  const mat = createBaroqueCutoutMaterial(comp.tex, { xMin: 0.2, xMax: 0.8, yMin: 0.25, yMax: 0.74 });
  const pivotGroup = new THREE.Group();
  pivotGroup.position.set(xPos, 0.25, item.z);
  scene.add(pivotGroup);

  const frameMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.55), mat);
  pivotGroup.add(frameMesh);

  const dir = item.side === 'left' ? 1 : -1;
  frameMesh.userData = {
    inspectable: true,
    alignPos: { x: xPos + dir * 2.8, y: 0.25, z: item.z + 1.1 },
    lookTarget: { x: xPos, y: 0.25, z: item.z }
  };

  galleryFrameObjects.push({
    group: pivotGroup,
    mesh: frameMesh,
    z: item.z,
    side: item.side,
    currentTilt: 0.35
  });
});

// Centerpiece Carved Baroque Cinema Screen at Z = -48
const cinemaComp = createCompositedRectFrameTexture(rectFrameTex.image, (ctx) => {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f7e49e';
  ctx.font = 'bold 78px Cinzel, serif';
  ctx.fillText('▶', 480, 340);

  ctx.fillStyle = '#faefd7';
  ctx.font = 'bold 42px Cinzel, serif';
  ctx.fillText('RHIAN JADE — PRE-DEBUT FILM', 480, 425);

  ctx.fillStyle = '#d4af37';
  ctx.font = 'italic 34px "Cormorant Garamond", serif';
  ctx.fillText('Save the Date Teaser • January 9, 2027', 480, 478);
});
compositeRenders.push(cinemaComp.render);

const cinemaMat = createBaroqueCutoutMaterial(cinemaComp.tex, { xMin: 0.2, xMax: 0.8, yMin: 0.25, yMax: 0.74 });
const cinemaMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 3.6), cinemaMat);
cinemaMesh.position.set(0, 0.35, -48);
cinemaMesh.userData = {
  inspectable: true,
  alignPos: { x: 0, y: 0.35, z: -43.5 },
  lookTarget: { x: 0, y: 0.35, z: -48 }
};
scene.add(cinemaMesh);

/* =========================================================================
   10. STATION IV & V (Z = -56 to Z = -96):
       SILHOUETTE-CUTOUT ENCHANTED ROSE CLOCHE + 4 SEPARATE CARVED BAROQUE
       PARCHMENT PLAQUES THAT POP PER SCROLL (ZERO CLICKING NEEDED!)
   ========================================================================= */
const clocheCutoutMat = createClocheCutoutMaterial(clocheArtTex);
const clocheMasterpieceMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 3.5), clocheCutoutMat);
clocheMasterpieceMesh.position.set(0, 0.35, -56);
scene.add(clocheMasterpieceMesh);

const separate18ScrollsData = [
  {
    z: -64,
    x: -1.05,
    crest: '⚜ I • EIGHTEEN ROSES ⚜',
    title: '18 ROSES',
    sub: 'The Gentlemen of the Royal Waltz',
    role: 'Cavalier of the Rose'
  },
  {
    z: -74,
    x: 1.05,
    crest: '⚜ II • EIGHTEEN CANDLES ⚜',
    title: '18 CANDLES',
    sub: 'The Ladies Lighting the Path',
    role: 'Bearer of Light'
  },
  {
    z: -84,
    x: -1.05,
    crest: '⚜ III • EIGHTEEN TREASURES ⚜',
    title: '18 TREASURES',
    sub: 'Tokens of Wisdom & Keepsakes',
    role: 'Keeper of Wisdom'
  },
  {
    z: -94,
    x: 1.05,
    crest: '⚜ IV • EIGHTEEN BLUE BILLS ⚜',
    title: '18 BLUE BILLS',
    sub: 'Blessings of Prosperity & Grace',
    role: 'Sponsor of Grace'
  }
];

const popScrollObjects = [];

separate18ScrollsData.forEach((sc) => {
  const comp = createCompositedParchmentCardTexture(parchmentCardTex.image, (ctx) => {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#7a5410';
    ctx.font = 'bold 20px Cinzel, serif';
    ctx.fillText(sc.crest, 450, 340);

    ctx.fillStyle = '#8b0018';
    ctx.font = 'bold 42px Cinzel, serif';
    ctx.fillText(sc.title, 450, 388);

    ctx.fillStyle = '#4a040d';
    ctx.font = 'italic 23px "Cormorant Garamond", serif';
    ctx.fillText(sc.sub, 450, 420);

    ctx.strokeStyle = 'rgba(138, 100, 21, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(260, 436);
    ctx.lineTo(640, 436);
    ctx.stroke();

    // Two Columns of 9 Names inside the Blank Parchment Area (X: 245..655, Y: 468..865)
    ctx.textAlign = 'left';
    for (let i = 0; i < 18; i++) {
      const col = i < 9 ? 0 : 1;
      const row = i % 9;
      const x = col === 0 ? 248 : 458;
      const y = 472 + row * 44;
      const num = String(i + 1).padStart(2, '0');

      ctx.fillStyle = '#8b0018';
      ctx.font = 'bold 17px Cinzel, serif';
      ctx.fillText(`${num}.`, x, y);

      ctx.fillStyle = '#2d0409';
      ctx.font = '600 18px "Cormorant Garamond", serif';
      ctx.fillText(`${sc.role} ${num}`, x + 30, y);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#6e0515';
    ctx.font = 'italic 20px "Cormorant Garamond", serif';
    ctx.fillText('Rhian Jade Bianzon • January 9, 2027', 450, 895);
  });
  compositeRenders.push(comp.render);

  const mat = createBaroqueCutoutMaterial(comp.tex);
  const rootGroup = new THREE.Group();
  rootGroup.position.set(sc.x, 0.3, sc.z);
  scene.add(rootGroup);

  const popMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 4.5), mat);
  // Starts compact and pops up automatically as the camera scrolls near it!
  popMesh.scale.set(0.01, 0.01, 0.01);
  popMesh.userData = {
    inspectable: true,
    alignPos: { x: sc.x, y: 0.3, z: sc.z + 3.8 },
    lookTarget: { x: sc.x, y: 0.3, z: sc.z }
  };
  rootGroup.add(popMesh);

  popScrollObjects.push({
    root: rootGroup,
    mesh: popMesh,
    z: sc.z,
    baseX: sc.x,
    isPopped: false
  });
});

/* =========================================================================
   11. STATION VI (Z = -105): ATTIRE & ROYAL RSVP PARCHMENT CUTOUT
   ========================================================================= */
const rsvpStationGroup = new THREE.Group();
rsvpStationGroup.position.set(0, 0.25, -105);
scene.add(rsvpStationGroup);

const rsvpComp = createCompositedParchmentCardTexture(parchmentCardTex.image, (ctx) => {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7a5410';
  ctx.font = 'bold 26px Cinzel, serif';
  ctx.fillText('⚜ 👑 ⚜', 450, 355);

  ctx.fillStyle = '#8b0018';
  ctx.font = 'bold 46px Cinzel, serif';
  ctx.fillText('ROYAL RSVP', 450, 415);

  ctx.fillStyle = '#4a040d';
  ctx.font = 'italic 26px "Cormorant Garamond", serif';
  ctx.fillText('Attire: Royal Crimson, 24k Gold & Obsidian', 450, 465);

  ctx.fillStyle = '#8b0018';
  ctx.font = '500 58px "Great Vibes", cursive';
  ctx.fillText('Rhian Jade Bianzon', 450, 565);

  ctx.fillStyle = '#4a040d';
  ctx.font = 'bold 26px Cinzel, serif';
  ctx.fillText('SATURDAY • JANUARY 9, 2027', 450, 635);

  // Molten Wax Seal Emblem Prompt
  ctx.beginPath();
  ctx.arc(450, 765, 68, 0, Math.PI * 2);
  ctx.fillStyle = '#8b0018';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#d4af37';
  ctx.stroke();

  ctx.fillStyle = '#f7e49e';
  ctx.font = 'bold 19px Cinzel, serif';
  ctx.fillText('TAP TO INSCRIBE', 450, 758);
  ctx.fillText('& SEAL RSVP', 450, 784);
});
compositeRenders.push(rsvpComp.render);

const rsvpCutoutMat = createBaroqueCutoutMaterial(rsvpComp.tex);
const rsvpPlaqueMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 4.8), rsvpCutoutMat);
rsvpPlaqueMesh.userData = { isRsvpLectern: true };
rsvpStationGroup.add(rsvpPlaqueMesh);

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
const petalMat = new THREE.MeshBasicMaterial({ color: 0x9b001a, side: THREE.DoubleSide });
const petals = [];
for (let i = 0; i < 80; i++) {
  const p = new THREE.Mesh(petalGeo, petalMat);
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
   13. PORTFOLIO-STYLE CAMERA CONTROLLER & ENVELOPE ZOOM-THROUGH
   ========================================================================= */
let hasEnteredBallroom = false;
let isEnvelopeAnimating = false;
let cameraOverride = false;
let targetZ = 13.5;
let currentZ = 28;
const MIN_CORRIDOR_Z = -101.5;
const MAX_CORRIDOR_Z = 13.5;

const mouseNorm = { x: 0, y: 0 };
const smoothParallax = { x: 0, y: 0 };
let targetSwipeGlance = 0;
let currentSwipeGlance = 0;
const savedCorridorCam = { x: 0, y: 0.25, z: 13.5 };
const lookAtProxy = new THREE.Vector3(0, 0.25, 0);

const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let isSealHovered = false;

function triggerEnvelopeZoomOpen() {
  if (hasEnteredBallroom || isEnvelopeAnimating) return;
  isEnvelopeAnimating = true;
  document.body.style.cursor = 'auto';

  audio.startWaltz();
  audio.playSealChime();

  const entranceHud = document.getElementById('entrance-hud');
  if (entranceHud) entranceHud.classList.add('fade-out');

  popoutCardMesh.visible = true;

  const tl = gsap.timeline({
    onComplete: () => {
      hasEnteredBallroom = true;
      isEnvelopeAnimating = false;
      entranceGroup.visible = false;
      currentZ = 13.5;
      targetZ = 13.5;
      document.body.classList.remove('locked-at-entrance');
    }
  });

  // 1. Gold Rose Wax Seal Spins & Lifts Off
  tl.to(waxSealMesh.rotation, { z: Math.PI * 1.5, duration: 0.55, ease: 'power2.inOut' }, 0);
  tl.to([waxSealMesh.scale, sealRingMesh.scale], { x: 1.5, y: 1.5, duration: 0.45, ease: 'back.in(1.5)' }, 0);
  tl.to([waxSealMesh.scale, sealRingMesh.scale], { x: 0.01, y: 0.01, duration: 0.2, ease: 'power2.in' }, 0.45);

  // 2. Envelope Softens Back while the Carved 24k Baroque Gold & Parchment Invitation Card Rises Out!
  tl.to(croppedEnvMat.uniforms.uOpacity, { value: 0.25, duration: 0.7, ease: 'power2.out' }, 0.25);
  tl.to(envBodyMesh.position, { y: -0.9, duration: 0.85, ease: 'power2.inOut' }, 0.25);
  tl.to(popoutCardMesh.position, { y: 0.1, z: 0.22, duration: 0.95, ease: 'power3.out' }, 0.3);
  tl.to(popoutCardMesh.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.95, ease: 'back.out(1.25)' }, 0.3);

  // 3. Camera Zooms Straight INTO the Risen Invitation Card & Parts the Opera Stage Curtains into the Ballroom!
  tl.to(leftStageCurtain.position, { x: -STAGE_W * 0.65, duration: 1.55, ease: 'power3.inOut' }, 1.35);
  tl.to(rightStageCurtain.position, { x: STAGE_W * 0.65, duration: 1.55, ease: 'power3.inOut' }, 1.35);
  tl.to(croppedEnvMat.uniforms.uOpacity, { value: 0.0, duration: 0.45 }, 1.35);
  tl.to(popoutCardMesh.scale, { x: 3.2, y: 3.2, z: 3.2, duration: 1.25, ease: 'power2.in' }, 1.4);
  tl.to(popoutCardMat.uniforms.uOpacity, { value: 0.0, duration: 0.55, ease: 'power2.in' }, 1.85);

  tl.to(
    camera.position,
    { z: 13.5, y: 0.25, duration: 1.65, ease: 'power3.inOut' },
    1.35
  );
}

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

// Mobile Touch Drag + Momentum + Horizontal Swipe Glance
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
    targetSwipeGlance = THREE.MathUtils.clamp(targetSwipeGlance + deltaX * 0.0008, -0.28, 0.28);

    touchState.lastY = curY;
    touchState.startX = curX;
  },
  { passive: true }
);

window.addEventListener('touchend', () => {
  touchState.isDragging = false;
});

// Pointer Move: Wax Seal Hover Only (Envelope NEVER tilts like a card!)
window.addEventListener('pointermove', (e) => {
  mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNorm.y = -((e.clientY / window.innerHeight) * 2 - 1);

  pointerNDC.x = mouseNorm.x;
  pointerNDC.y = mouseNorm.y;
  raycaster.setFromCamera(pointerNDC, camera);

  if (!hasEnteredBallroom && !isEnvelopeAnimating) {
    const hits = raycaster.intersectObjects([waxSealMesh, envBodyMesh], false);
    if (hits.length > 0) {
      if (!isSealHovered) {
        isSealHovered = true;
        document.body.style.cursor = 'pointer';
        audio.playHoverHint();
        gsap.to(waxSealMesh.rotation, { z: 0.18, duration: 0.35, ease: 'power2.out' });
        gsap.to(waxSealMesh.scale, { x: 1.12, y: 1.12, duration: 0.35, ease: 'back.out(1.7)' });
        gsap.to(sealCutoutMat.uniforms.uGlow, { value: 0.35, duration: 0.35 });
      }
    } else if (isSealHovered) {
      isSealHovered = false;
      document.body.style.cursor = 'auto';
      gsap.to(waxSealMesh.rotation, { z: 0, duration: 0.35, ease: 'power2.out' });
      gsap.to(waxSealMesh.scale, { x: 1, y: 1, duration: 0.35, ease: 'power2.out' });
      gsap.to(sealCutoutMat.uniforms.uGlow, { value: 0.0, duration: 0.35 });
    }
    return;
  }

  if (hasEnteredBallroom && !cameraOverride) {
    const interactiveMeshes = [
      heroOvalMesh,
      cinemaMesh,
      rsvpPlaqueMesh,
      ...galleryFrameObjects.map((g) => g.mesh),
      ...popScrollObjects.map((s) => s.mesh)
    ];
    const hits = raycaster.intersectObjects(interactiveMeshes, false);
    document.body.style.cursor = hits.length > 0 ? 'pointer' : 'auto';
  }
});

// Pointer Click
window.addEventListener('click', (e) => {
  if (e.target.closest('#navigation-ui, #station-context-bar, dialog')) return;

  pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointerNDC.y = -((e.clientY / window.innerHeight) * 2 - 1);
  raycaster.setFromCamera(pointerNDC, camera);

  if (!hasEnteredBallroom && !isEnvelopeAnimating) {
    const hits = raycaster.intersectObjects([waxSealMesh, envBodyMesh], false);
    if (hits.length > 0) {
      triggerEnvelopeZoomOpen();
    }
    return;
  }

  if (hasEnteredBallroom && !cameraOverride) {
    const interactiveMeshes = [
      heroOvalMesh,
      cinemaMesh,
      rsvpPlaqueMesh,
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

  entranceGroup.visible = true;
  envBodyMesh.position.set(0, 0, 0);
  croppedEnvMat.uniforms.uOpacity.value = 1.0;
  waxSealMesh.rotation.set(0, 0, 0);
  waxSealMesh.scale.set(1, 1, 1);
  sealRingMesh.scale.set(1, 1, 1);
  popoutCardMesh.visible = false;
  popoutCardMesh.position.set(0, -0.3, 0.08);
  popoutCardMesh.scale.setScalar(0.5);
  popoutCardMat.uniforms.uOpacity.value = 1.0;
  leftStageCurtain.position.set(-STAGE_W / 4, 0, -0.8);
  rightStageCurtain.position.set(STAGE_W / 4, 0, -0.8);
  camera.position.set(0, 0.25, 28);
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

  // Responsive Scaling for Mobile & Tablet
  envelopeGroup.scale.setScalar(responsiveScale);
  heroStationGroup.scale.setScalar(responsiveScale);
  countdownStationGroup.scale.setScalar(responsiveScale);
  cinemaMesh.scale.setScalar(responsiveScale);
  clocheMasterpieceMesh.scale.setScalar(responsiveScale);
  rsvpStationGroup.scale.setScalar(responsiveScale);

  // Smooth Mouse Parallax & Mobile Swipe Glance
  smoothParallax.x = THREE.MathUtils.lerp(smoothParallax.x, mouseNorm.x * 0.35, 0.05);
  smoothParallax.y = THREE.MathUtils.lerp(smoothParallax.y, mouseNorm.y * 0.2, 0.05);
  currentSwipeGlance = THREE.MathUtils.lerp(currentSwipeGlance, targetSwipeGlance, 0.08);

  if (!hasEnteredBallroom && !isEnvelopeAnimating) {
    const pulse = 1 + Math.sin(time * 2.5) * 0.04;
    sealRingMesh.scale.set(pulse, pulse, 1);
    camera.position.x = smoothParallax.x * 0.25;
    camera.position.y = 0.25 + smoothParallax.y * 0.18;
    camera.lookAt(0, 0.25, ENTRANCE_Z);
  } else if (hasEnteredBallroom && !cameraOverride) {
    if (!touchState.isDragging && Math.abs(touchState.velocityY) > 0.1) {
      targetZ = THREE.MathUtils.clamp(targetZ - touchState.velocityY * 0.03, MIN_CORRIDOR_Z, MAX_CORRIDOR_Z);
      touchState.velocityY *= 0.92;
    }

    currentZ = THREE.MathUtils.lerp(currentZ, targetZ, 0.055);

    const walkProgress = Math.max(0, Math.min(1, (MAX_CORRIDOR_Z - currentZ) / (MAX_CORRIDOR_Z - MIN_CORRIDOR_Z)));
    if (progEl) progEl.style.transform = `scaleX(${walkProgress})`;
    ballroomVistaMat.uniforms.uWalkProgress.value = walkProgress;

    // Auto-Glance toward nearby Gallery Portrait Frames
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
    camera.position.y = 0.25 + smoothParallax.y;

    farBallroomMesh.position.z = currentZ - 22;
    farBallroomMesh.position.x = smoothParallax.x * 0.2;

    lookAtProxy.set(
      smoothParallax.x * 0.35 + glanceX + currentSwipeGlance * 3.5,
      0.25 + smoothParallax.y * 0.4,
      currentZ - 10
    );
    camera.lookAt(lookAtProxy);

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

  // 2. Dynamic Proximity Tilt on Sawtooth Gallery Frames
  galleryFrameObjects.forEach((item) => {
    item.group.position.x = (item.side === 'left' ? -2.9 : 2.9) * responsiveScale;
    item.group.scale.setScalar(responsiveScale);
    const d = Math.abs(camera.position.z - item.z);
    const targetAngle = d < 11 ? 0.36 : 0.85;
    item.currentTilt = THREE.MathUtils.lerp(item.currentTilt, targetAngle, 0.06);
    item.group.rotation.y = item.side === 'left' ? item.currentTilt : -item.currentTilt;
  });

  // 3. Separate 18s Carved Baroque Parchment Plaques That Automatically Pop On Scroll!
  popScrollObjects.forEach((sc) => {
    sc.root.position.x = sc.baseX * responsiveScale;
    sc.root.scale.setScalar(responsiveScale);

    const distZ = camera.position.z - sc.z;
    const shouldBeOpen = distZ < 13.5 && distZ > -6;

    if (shouldBeOpen && !sc.isPopped) {
      sc.isPopped = true;
      audio.playHoverHint();
      gsap.to(sc.mesh.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.85,
        ease: 'back.out(1.4)'
      });
    } else if (!shouldBeOpen && sc.isPopped) {
      sc.isPopped = false;
      gsap.to(sc.mesh.scale, {
        x: 0.01,
        y: 0.01,
        z: 0.01,
        duration: 0.45,
        ease: 'power2.in'
      });
    }
  });

  // 4. Falling Crimson Rose Petals
  petals.forEach((p) => {
    p.position.y -= p.userData.speedY;
    p.position.x += Math.sin(time + p.userData.sway) * 0.008;
    p.rotation.x += p.userData.rotX;
    p.rotation.z += p.userData.rotZ;
    if (p.position.y < -3.2) p.position.y = 5.5;
  });

  renderer.render(scene, camera);
}

animate();
