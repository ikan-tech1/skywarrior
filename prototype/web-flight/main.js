import * as THREE from 'three';

const FALLBACK_MISSION = {
  missionId: 'M01_first_light',
  title: 'First Light',
  briefing: 'Viper Squadron, clear Ashford Shrike patrol over Port Kestrel. Destroy 2 enemy fighters and 3 SAM sites. AWACS Meridian Eye is on station.',
  timeLimitSeconds: 600,
  objectives: [
    { type: 'air', label: 'Destroy fighters', need: 2 },
    { type: 'ground', label: 'Destroy SAM sites', need: 3 },
  ],
  radio: [
    { speaker: 'Meridian Eye', line: 'Viper-1, hostile contacts bearing 270 over the harbor.', at: 8 },
    { speaker: 'Solano', line: 'Stay on the bandits — SAMs will light up if you drop low.', at: 25 },
    { speaker: 'Meridian Eye', line: 'Good kills, Viper-1. Clear remaining emitters.', at: 45 },
  ],
  spawns: {
    air: [[3000, 1200, -4000], [4500, 1400, -4800]],
    ground: [[-1500, 0, -2500], [-600, 0, -2900], [300, 0, -3300]],
  },
};

let MISSION = FALLBACK_MISSION;

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x9eb8d8, 0.000028);

const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 2, 80000);
const clock = new THREE.Clock();

const player = {
  pos: new THREE.Vector3(0, 1800, 800),
  vel: new THREE.Vector3(0, 0, -200),
  rot: new THREE.Euler(0, 0, 0, 'YXZ'),
  throttle: 0.72,
  pitch: 0,
  roll: 0,
  yaw: 0,
  speed: 450,
  hp: 100,
  gunAmmo: 800,
  missiles: 4,
};

const camState = { pos: new THREE.Vector3(), look: new THREE.Vector3() };

const tuning = {
  maxThrust: 80000,
  drag: 0.015,
  pitchRate: 58,
  rollRate: 125,
  yawRate: 28,
  stallSpeed: 140,
  stallAssist: 0.38,
  maxSpeed: 850,
  minSpeed: 120,
  gunProjectileSpeed: 900,
};

const enemies = [];
const sams = [];
const tracerMeshes = [];
const sparkMeshes = [];
const keys = {};

let playerMesh = null;
let sunLight = null;

const mission = {
  timeLimit: 600,
  elapsed: 0,
  active: false,
  objectives: [],
  radioPlayed: new Set(),
};

let lockState = 'searching';
let lockProgress = 0;
let lockTarget = null;
let samAlertTimer = 0;
let prevLockState = 'searching';

let audioCtx;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, duration, type = 'sine', gain = 0.08) {
  ensureAudio();
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(g).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playLockTone(state) {
  if (state === 'tracking') playTone(880, 0.06, 'square', 0.04);
  if (state === 'locked') {
    playTone(1200, 0.08, 'square', 0.06);
    playTone(1600, 0.1, 'sine', 0.05);
  }
  if (state === 'missile') {
    playTone(400, 0.15, 'sawtooth', 0.1);
    playTone(300, 0.15, 'sawtooth', 0.08);
  }
}

function knotsToUnits(k) {
  return k * 0.514444 * 8;
}

function playerQuat() {
  return new THREE.Quaternion().setFromEuler(player.rot);
}

function getForward() {
  return new THREE.Vector3(0, 0, -1).applyQuaternion(playerQuat());
}

function computeLeadPoint(targetPos, targetVel) {
  const shooterVel = getForward().multiplyScalar(knotsToUnits(player.speed));
  const toT = targetPos.clone().sub(player.pos);
  const relV = targetVel.clone().sub(shooterVel);
  const speed = tuning.gunProjectileSpeed;
  let t = toT.length() / speed;
  const a = relV.lengthSq() - speed * speed;
  const b = 2 * toT.dot(relV);
  const c = toT.lengthSq();
  if (Math.abs(a) > 1e-6) {
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const s = Math.sqrt(disc);
      const t1 = (-b - s) / (2 * a);
      const t2 = (-b + s) / (2 * a);
      t = t1 > 0 ? t1 : t2 > 0 ? t2 : t;
    }
  }
  t = Math.min(Math.max(t, 0), 8);
  return targetPos.clone().addScaledVector(targetVel, t);
}

function worldToScreen(worldPos) {
  const v = worldPos.clone().project(camera);
  if (v.z > 1) return null;
  return {
    x: (v.x * 0.5 + 0.5) * innerWidth,
    y: (-v.y * 0.5 + 0.5) * innerHeight,
  };
}

function jetMaterial(color, metal = 0.35) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: metal,
    roughness: 0.45,
    flatShading: false,
  });
}

function createFighterMesh(primary, accent) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 95), jetMaterial(primary));
  body.position.set(0, 0, 8);
  group.add(body);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(11, 38, 8), jetMaterial(accent, 0.5));
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0, -58);
  group.add(nose);

  const wing = new THREE.Mesh(new THREE.BoxGeometry(110, 3, 42), jetMaterial(primary));
  wing.position.set(0, -2, 10);
  group.add(wing);

  const tail = new THREE.Mesh(new THREE.BoxGeometry(38, 3, 22), jetMaterial(primary));
  tail.position.set(0, 6, 48);
  group.add(tail);

  const vtail = new THREE.Mesh(new THREE.BoxGeometry(3, 28, 20), jetMaterial(accent));
  vtail.position.set(0, 14, 44);
  group.add(vtail);

  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(9, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.85 })
  );
  canopy.rotation.x = Math.PI;
  canopy.position.set(0, 8, -18);
  group.add(canopy);

  const exhaust = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 9, 14, 8),
    new THREE.MeshStandardMaterial({ color: 0x334455, emissive: 0x223344, emissiveIntensity: 0.4 })
  );
  exhaust.rotation.x = Math.PI / 2;
  exhaust.position.set(0, 0, 58);
  group.add(exhaust);

  group.scale.setScalar(1.8);
  return group;
}

function createPlayerJet() {
  const jet = createFighterMesh(0x7a8fa8, 0xc5d4e8);
  jet.userData.role = 'player';
  scene.add(jet);
  return jet;
}

function createEnemy(x, y, z) {
  const mesh = createFighterMesh(0x8a3030, 0xaa5555);
  mesh.position.set(x, y, z);
  mesh.userData = { type: 'air', hp: 60, alive: true, vel: new THREE.Vector3() };
  scene.add(mesh);
  return mesh;
}

function createSAM(x, y, z) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(55, 70, 28, 10),
    new THREE.MeshStandardMaterial({ color: 0x4a5a3a, roughness: 0.8 })
  );
  base.position.y = 14;
  group.add(base);

  const radar = new THREE.Mesh(
    new THREE.BoxGeometry(40, 8, 20),
    new THREE.MeshStandardMaterial({ color: 0x667755, emissive: 0x223311, emissiveIntensity: 0.3 })
  );
  radar.position.y = 38;
  group.add(radar);

  const launcher = new THREE.Mesh(
    new THREE.BoxGeometry(12, 50, 12),
    new THREE.MeshStandardMaterial({ color: 0x556644 })
  );
  launcher.position.set(30, 30, 0);
  launcher.rotation.z = -0.4;
  group.add(launcher);

  group.position.set(x, y, z);
  group.userData = { type: 'ground', hp: 40, alive: true, fireTimer: 0 };
  scene.add(group);
  return group;
}

function createSky() {
  const skyGeo = new THREE.SphereGeometry(45000, 32, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(0x4a90c8) },
      horizonColor: { value: new THREE.Color(0xb8d4f0) },
      bottomColor: { value: new THREE.Color(0xe8f2ff) },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPosition = wp.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        vec3 col = h > 0.0
          ? mix(horizonColor, topColor, pow(h, 0.55))
          : mix(horizonColor, bottomColor, pow(-h, 0.8));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));
}

function createOcean() {
  const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(120000, 120000, 1, 1),
    new THREE.MeshStandardMaterial({
      color: 0x1a5a7a,
      roughness: 0.15,
      metalness: 0.2,
      emissive: 0x0a2030,
      emissiveIntensity: 0.15,
    })
  );
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.y = 0;
  scene.add(ocean);

  const coast = new THREE.Mesh(
    new THREE.PlaneGeometry(120000, 120000),
    new THREE.MeshStandardMaterial({ color: 0x3d5a3d, roughness: 0.95 })
  );
  coast.rotation.x = -Math.PI / 2;
  coast.position.y = 2;
  coast.position.z = -12000;
  scene.add(coast);
}

function createPortKestrel() {
  const mat = new THREE.MeshStandardMaterial({ color: 0x6a7080, roughness: 0.7 });
  const dock = new THREE.Mesh(new THREE.BoxGeometry(1200, 60, 400), mat);
  dock.position.set(-800, 30, -2000);
  scene.add(dock);

  for (let i = 0; i < 14; i++) {
    const h = 80 + Math.random() * 220;
    const b = new THREE.Mesh(new THREE.BoxGeometry(120 + Math.random() * 180, h, 120 + Math.random() * 100), mat);
    b.position.set(-2200 + i * 280, h * 0.5, -2800 + (i % 4) * 320);
    scene.add(b);
  }

  for (let i = 0; i < 6; i++) {
    const crane = new THREE.Mesh(new THREE.BoxGeometry(40, 180, 40), new THREE.MeshStandardMaterial({ color: 0xffaa44 }));
    crane.position.set(-1400 + i * 200, 90, -1600);
    scene.add(crane);
  }
}

function createClouds() {
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  for (let i = 0; i < 24; i++) {
    const cloud = new THREE.Group();
    const puffs = 3 + Math.floor(Math.random() * 4);
    for (let p = 0; p < puffs; p++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(200 + Math.random() * 350, 8, 6), cloudMat);
      puff.position.set((Math.random() - 0.5) * 600, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 400);
      cloud.add(puff);
    }
    cloud.position.set((Math.random() - 0.5) * 25000, 2500 + Math.random() * 4000, -3000 - Math.random() * 12000);
    scene.add(cloud);
  }
}

function spawnWorld() {
  createSky();
  createOcean();
  createPortKestrel();
  createClouds();

  sunLight = new THREE.DirectionalLight(0xfff4e0, 1.35);
  sunLight.position.set(8000, 12000, 4000);
  scene.add(sunLight);
  scene.add(new THREE.HemisphereLight(0x88bbee, 0x224466, 0.65));
  scene.add(new THREE.AmbientLight(0x446688, 0.25));

  playerMesh = createPlayerJet();
  respawnEntities();
}

function respawnEntities() {
  for (const e of enemies) scene.remove(e);
  for (const s of sams) scene.remove(s);
  enemies.length = 0;
  sams.length = 0;

  const airSpawns = MISSION.spawns?.air || FALLBACK_MISSION.spawns.air;
  const groundSpawns = MISSION.spawns?.ground || FALLBACK_MISSION.spawns.ground;

  for (const [x, y, z] of airSpawns) enemies.push(createEnemy(x, y, z));
  for (const [x, y, z] of groundSpawns) sams.push(createSAM(x, y, z));
}

function syncPlayerMesh() {
  if (!playerMesh) return;
  playerMesh.position.copy(player.pos);
  playerMesh.quaternion.copy(playerQuat());
}

function updateFlight(dt) {
  player.rot.x += player.pitch * THREE.MathUtils.degToRad(tuning.pitchRate) * dt;
  player.rot.z += player.roll * THREE.MathUtils.degToRad(tuning.rollRate) * dt;
  player.rot.y += player.yaw * THREE.MathUtils.degToRad(tuning.yawRate) * dt;

  if (player.speed < tuning.stallSpeed) {
    player.rot.x -= tuning.stallAssist * THREE.MathUtils.degToRad(tuning.pitchRate) * dt;
  }
  player.rot.x = THREE.MathUtils.clamp(player.rot.x, -Math.PI / 3, Math.PI / 3);

  const q = playerQuat();
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
  const speedUnits = knotsToUnits(player.speed);
  const thrust = tuning.maxThrust * player.throttle;
  const drag = tuning.drag * speedUnits * speedUnits;
  const newSpeedUnits = THREE.MathUtils.clamp(
    speedUnits + ((thrust - drag) / 15000) * dt,
    knotsToUnits(tuning.minSpeed),
    knotsToUnits(tuning.maxSpeed)
  );
  player.speed = newSpeedUnits / (0.514444 * 8);
  player.pos.addScaledVector(forward, newSpeedUnits * dt);
  player.pos.y = Math.max(120, player.pos.y);
  player.vel.copy(forward).multiplyScalar(newSpeedUnits);

  if (sunLight) sunLight.position.copy(player.pos).add(new THREE.Vector3(8000, 12000, 4000));
  syncPlayerMesh();
}

function updateEnemies(dt) {
  for (const e of enemies) {
    if (!e.userData.alive) continue;
    const dir = player.pos.clone().sub(e.position);
    const dist = dir.length();
    if (dist < 1) continue;
    dir.normalize();
    e.userData.vel.copy(dir).multiplyScalar(knotsToUnits(340));
    const targetQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir);
    e.quaternion.slerp(targetQ, dt * 1.2);
    e.position.addScaledVector(dir, knotsToUnits(340) * dt * (dist > 8000 ? 0.6 : 1));
  }
}

function updateSAMs(dt) {
  for (const s of sams) {
    if (!s.userData.alive) continue;
    s.userData.fireTimer += dt;
    const dist = s.position.distanceTo(player.pos);
    if (dist < 22000 && player.pos.y < 4500 && s.userData.fireTimer > 4.5) {
      player.hp -= 7;
      s.userData.fireTimer = 0;
      samAlertTimer = 1.4;
      playLockTone('missile');
      flashMsg('SAM HIT', '#ff6666');
    }
  }
}

function updateLock(dt) {
  let best = null;
  let bestDist = Infinity;
  const fwd = getForward();
  for (const e of enemies) {
    if (!e.userData.alive) continue;
    const dist = e.position.distanceTo(player.pos);
    const toE = e.position.clone().sub(player.pos).normalize();
    if (fwd.dot(toE) > 0.82 && dist < 50000 && dist < bestDist) {
      bestDist = dist;
      best = e;
    }
  }

  const box = document.getElementById('lockBox');
  const label = document.getElementById('lockLabel');
  if (!best) {
    lockState = 'searching';
    lockProgress = 0;
    lockTarget = null;
    box.className = 'lock-box';
    box.style.display = 'none';
    label.textContent = '';
    return;
  }

  lockTarget = best;
  if (lockState !== 'locked') {
    lockState = 'tracking';
    lockProgress += dt;
    if (lockProgress >= 1.1) lockState = 'locked';
  }

  if (lockState !== prevLockState) {
    if (lockState === 'tracking' && prevLockState === 'searching') playLockTone('tracking');
    if (lockState === 'locked') playLockTone('locked');
    prevLockState = lockState;
  }

  box.style.display = 'block';
  box.className = 'lock-box ' + (lockState === 'locked' ? 'locked' : 'tracking');
  const screen = worldToScreen(best.position);
  if (screen) {
    box.style.left = `${screen.x}px`;
    box.style.top = `${screen.y}px`;
    label.textContent = `${Math.round(best.position.distanceTo(player.pos) / 100)}m`;
  }
}

function addTracer(from, to) {
  const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
  const mat = new THREE.LineBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.95 });
  const line = new THREE.Line(geo, mat);
  scene.add(line);
  tracerMeshes.push({ mesh: line, life: 0.14 });
}

function addSpark(pos) {
  const geo = new THREE.SphereGeometry(25, 6, 6);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.9 });
  const spark = new THREE.Mesh(geo, mat);
  spark.position.copy(pos);
  scene.add(spark);
  sparkMeshes.push({ mesh: spark, life: 0.22 });
}

function updateVFX(dt) {
  for (let i = tracerMeshes.length - 1; i >= 0; i--) {
    tracerMeshes[i].life -= dt;
    if (tracerMeshes[i].life <= 0) {
      scene.remove(tracerMeshes[i].mesh);
      tracerMeshes[i].mesh.geometry.dispose();
      tracerMeshes[i].mesh.material.dispose();
      tracerMeshes.splice(i, 1);
    }
  }
  for (let i = sparkMeshes.length - 1; i >= 0; i--) {
    sparkMeshes[i].life -= dt;
    sparkMeshes[i].mesh.material.opacity = sparkMeshes[i].life / 0.22;
    if (sparkMeshes[i].life <= 0) {
      scene.remove(sparkMeshes[i].mesh);
      sparkMeshes[i].mesh.geometry.dispose();
      sparkMeshes[i].mesh.material.dispose();
      sparkMeshes.splice(i, 1);
    }
  }
}

function fireGun() {
  if (player.gunAmmo <= 0 || !mission.active) return;
  player.gunAmmo--;
  playTone(120, 0.04, 'sawtooth', 0.03);
  const fwd = getForward();
  const muzzle = player.pos.clone().addScaledVector(fwd, 120);
  let hitPoint = muzzle.clone().addScaledVector(fwd, 2500);

  for (const list of [enemies, sams]) {
    for (const t of list) {
      if (!t.userData.alive) continue;
      if (t.position.distanceTo(player.pos) > 22000) continue;
      const lead = t.userData.vel ? computeLeadPoint(t.position, t.userData.vel) : t.position;
      const toLead = lead.clone().sub(player.pos).normalize();
      if (fwd.dot(toLead) > 0.95) {
        t.userData.hp -= 14;
        hitPoint = t.position.clone();
        addSpark(t.position);
        if (t.userData.hp <= 0) destroyTarget(t);
      }
    }
  }
  addTracer(muzzle, hitPoint);
}

function fireMissile() {
  if (player.missiles <= 0 || lockState !== 'locked' || !lockTarget || !mission.active) return;
  player.missiles--;
  playTone(200, 0.2, 'sawtooth', 0.07);
  addSpark(lockTarget.position);
  destroyTarget(lockTarget);
  lockState = 'searching';
  lockProgress = 0;
  lockTarget = null;
  prevLockState = 'searching';
}

function destroyTarget(t) {
  if (!t.userData.alive) return;
  t.userData.alive = false;
  t.visible = false;
  playTone(80, 0.15, 'square', 0.06);
  const obj = mission.objectives.find((o) => o.type === t.userData.type && !o.done);
  if (obj) {
    obj.count++;
    if (obj.count >= obj.need) obj.done = true;
  }
  checkWin();
}

function calcRank() {
  const ratio = mission.elapsed / mission.timeLimit;
  if (ratio < 0.5) return 'S';
  if (ratio < 0.65) return 'A';
  if (ratio < 0.8) return 'B';
  if (ratio < 0.95) return 'C';
  return 'D';
}

function checkWin() {
  if (mission.objectives.every((o) => o.done)) {
    mission.active = false;
    document.getElementById('rank').textContent = calcRank();
    document.getElementById('debrief-stats').textContent =
      `Time: ${formatTime(mission.elapsed)} · HP: ${Math.round(player.hp)}% · Missiles left: ${player.missiles}`;
    document.getElementById('debrief').style.display = 'flex';
    document.getElementById('hud').style.display = 'none';
  }
}

function checkFail() {
  if (mission.elapsed >= mission.timeLimit) {
    mission.active = false;
    flashMsg('TIME EXPIRED', '#ff6666');
  }
  if (player.hp <= 0) {
    mission.active = false;
    flashMsg('AIRCRAFT LOST', '#ff6666');
  }
}

function flashMsg(text, color) {
  const el = document.getElementById('msg');
  el.textContent = text;
  el.style.color = color;
  el.classList.add('show');
}

function updateRadio() {
  for (const line of MISSION.radio || []) {
    const at = line.at ?? line.delay ?? 0;
    if (mission.elapsed >= at && !mission.radioPlayed.has(at)) {
      mission.radioPlayed.add(at);
      const el = document.getElementById('radio');
      document.getElementById('radioSpeaker').textContent = line.speaker.toUpperCase();
      document.getElementById('radioText').textContent = line.line;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 5000);
    }
  }
}

function buildCompass() {
  const strip = document.getElementById('compass-strip');
  strip.innerHTML = '';
  for (let d = 0; d < 360; d += 10) {
    const s = document.createElement('span');
    s.textContent = d % 30 === 0 ? String(d).padStart(3, '0') : '·';
    if (d % 90 === 0) s.className = 'major';
    strip.appendChild(s);
  }
}

function updateHUD() {
  if (!mission.active) return;
  document.getElementById('spd-val').textContent = Math.round(player.speed);
  document.getElementById('alt-val').textContent = Math.round(player.pos.y * 3.28);
  document.getElementById('weapon-panel').innerHTML =
    `VULCAN-20 <b>${player.gunAmmo}</b><br>SKR-IR <b>${player.missiles}</b><br><span style="color:${lockState === 'locked' ? '#ff6666' : '#ffd166'}">LOCK ${lockState.toUpperCase()}</span>`;

  document.getElementById('objectives').innerHTML = mission.objectives
    .map((o) => `${o.done ? '✓' : '○'} ${o.label} (${o.count}/${o.need})`)
    .join('<br>');
  document.getElementById('timer').textContent = `T-${formatTime(mission.timeLimit - mission.elapsed)}`;

  const heading = ((THREE.MathUtils.radToDeg(player.rot.y) % 360) + 360) % 360;
  document.getElementById('compass-strip').style.left = `${-heading * 4 + 210}px`;

  const radar = document.getElementById('radar');
  radar.querySelectorAll('.blip').forEach((b) => b.remove());
  for (const e of enemies) {
    if (!e.userData.alive) continue;
    addBlip(radar, e, false);
  }
  for (const s of sams) {
    if (!s.userData.alive) continue;
    addBlip(radar, s, true);
  }

  const leadPip = document.getElementById('lead-pip');
  if (lockTarget && lockTarget.userData.alive) {
    const lead = computeLeadPoint(lockTarget.position, lockTarget.userData.vel || new THREE.Vector3());
    const scr = worldToScreen(lead);
    if (scr) {
      leadPip.style.display = 'block';
      leadPip.style.left = `${scr.x}px`;
      leadPip.style.top = `${scr.y}px`;
    } else leadPip.style.display = 'none';
  } else leadPip.style.display = 'none';

  document.getElementById('alert').classList.toggle('show', samAlertTimer > 0);
}

function addBlip(radar, entity, isGround) {
  const rel = entity.position.clone().sub(player.pos);
  const blip = document.createElement('div');
  blip.className = 'blip' + (isGround ? ' ground' : '');
  blip.style.left = `${50 + rel.x / 180}%`;
  blip.style.top = `${50 + rel.z / 180}%`;
  radar.appendChild(blip);
}

function formatTime(s) {
  s = Math.max(0, Math.floor(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function updateCamera(dt) {
  const q = playerQuat();
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
  const chaseOffset = new THREE.Vector3(0, 140, 520).applyQuaternion(q);
  const desiredPos = player.pos.clone().add(chaseOffset);
  const desiredLook = player.pos.clone().addScaledVector(forward, 900).addScaledVector(up, 40);

  const smooth = 1 - Math.pow(0.001, dt);
  camState.pos.lerp(desiredPos, smooth);
  camState.look.lerp(desiredLook, smooth);
  camera.position.copy(camState.pos);
  camera.lookAt(camState.look);
}

function restart() {
  player.pos.set(0, 1800, 800);
  player.rot.set(0, 0, 0);
  player.speed = 450;
  player.throttle = 0.72;
  player.hp = 100;
  player.gunAmmo = 800;
  player.missiles = 4;
  mission.elapsed = 0;
  mission.active = true;
  mission.radioPlayed.clear();
  mission.objectives = MISSION.objectives.map((o) => ({
    ...o,
    need: o.need ?? o.count ?? 1,
    count: 0,
    done: false,
  }));
  lockState = 'searching';
  prevLockState = 'searching';
  lockProgress = 0;
  document.getElementById('msg').classList.remove('show');
  document.getElementById('debrief').style.display = 'none';
  document.getElementById('hud').style.display = 'block';
  respawnEntities();
  syncPlayerMesh();
  const q = playerQuat();
  camState.pos.copy(player.pos).add(new THREE.Vector3(0, 140, 520).applyQuaternion(q));
  camState.look.copy(player.pos).add(new THREE.Vector3(0, 0, -900).applyQuaternion(q));
}

function startMission() {
  document.getElementById('briefing').style.display = 'none';
  document.getElementById('hud').style.display = 'block';
  mission.active = true;
  ensureAudio();
  restart();
}

function normalizeSpawns(data) {
  const sp = data.spawns;
  if (Array.isArray(sp)) {
    return {
      air: sp.filter((s) => s.type === 'air').flatMap((s) => s.positions || []),
      ground: sp.filter((s) => s.type === 'ground').flatMap((s) => s.positions || []),
    };
  }
  if (sp && (sp.air || sp.ground)) {
    return { air: sp.air || [], ground: sp.ground || [] };
  }
  return { ...FALLBACK_MISSION.spawns };
}

function applyMissionData(data) {
  const spawns = normalizeSpawns(data);
  MISSION = {
    ...FALLBACK_MISSION,
    ...data,
    objectives: (data.objectives || FALLBACK_MISSION.objectives).map((o) => ({
      type: o.type,
      label: o.label,
      need: o.count ?? o.need ?? 1,
    })),
    radio: (data.radio || FALLBACK_MISSION.radio).map((r) => ({
      speaker: r.speaker,
      line: r.line,
      at: r.at ?? r.delay ?? 0,
    })),
    spawns,
  };
  if (!MISSION.spawns.air?.length) MISSION.spawns = { ...FALLBACK_MISSION.spawns };

  mission.timeLimit = MISSION.timeLimitSeconds || 600;
  mission.objectives = MISSION.objectives.map((o) => ({ ...o, count: 0, done: false }));

  document.getElementById('brief-text').textContent = MISSION.briefing;
  document.getElementById('brief-objs').innerHTML = MISSION.objectives
    .map((o) => `<li>${o.label} × ${o.need}</li>`)
    .join('');
  document.title = `SkyWarrior — ${MISSION.title || 'M01'}`;
}

async function loadMission() {
  try {
    const res = await fetch('./missions/M01_first_light.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    applyMissionData(await res.json());
  } catch (err) {
    applyMissionData(FALLBACK_MISSION);
    const el = document.getElementById('load-error');
    el.textContent = `Mission JSON fallback (${err.message})`;
    el.style.display = 'block';
  }
}

document.getElementById('startBtn').addEventListener('click', startMission);
document.getElementById('retryBtn').addEventListener('click', () => {
  document.getElementById('debrief').style.display = 'none';
  startMission();
});

addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space') {
    e.preventDefault();
    fireGun();
  }
  if (e.code === 'KeyF') fireMissile();
  if (e.code === 'KeyR') restart();
});
addEventListener('keyup', (e) => {
  keys[e.code] = false;
});
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

buildCompass();
applyMissionData(FALLBACK_MISSION);
spawnWorld();
loadMission();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (mission.active) {
    player.throttle = THREE.MathUtils.clamp(
      player.throttle + (keys.KeyW ? 1 : keys.KeyS ? -1 : 0) * dt * 0.5,
      0.25,
      1
    );
    player.pitch = (keys.ArrowUp ? -1 : 0) + (keys.ArrowDown ? 1 : 0);
    player.roll = (keys.KeyA ? -1 : 0) + (keys.KeyD ? 1 : 0);
    player.yaw = (keys.KeyQ ? -1 : 0) + (keys.KeyE ? 1 : 0);

    updateFlight(dt);
    updateEnemies(dt);
    updateSAMs(dt);
    updateLock(dt);
    updateRadio();
    mission.elapsed += dt;
    samAlertTimer = Math.max(0, samAlertTimer - dt);
    updateVFX(dt);
    checkFail();
  }

  updateCamera(dt);
  if (mission.active) updateHUD();
  renderer.render(scene, camera);
}
animate();
