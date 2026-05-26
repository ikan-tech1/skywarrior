import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const MISSION = {
  missionId: 'M01_first_light',
  title: 'First Light',
  briefing: 'Viper Squadron, clear Ashford Shrike patrol over Port Kestrel. Destroy 2 enemy fighters and 3 SAM sites. AWACS Meridian Eye is on station.',
  timeLimitSeconds: 600,
  objectives: [
    { type: 'air', label: 'Destroy fighters', need: 2, count: 0, done: false },
    { type: 'ground', label: 'Destroy SAM sites', need: 3, count: 0, done: false },
  ],
  radio: [
    { speaker: 'Meridian Eye', line: 'Viper-1, hostile contacts bearing 270 over the harbor.', at: 8, priority: 2 },
    { speaker: 'Solano', line: 'Stay on the bandits — SAMs will light up if you drop low.', at: 25, priority: 1 },
    { speaker: 'Meridian Eye', line: 'Good kills, Viper-1. Clear remaining emitters.', at: 45, priority: 2 },
  ],
};

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87a8cb);
scene.fog = new THREE.Fog(0x87a8cb, 2000, 25000);

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 1, 50000);
const clock = new THREE.Clock();

const player = {
  pos: new THREE.Vector3(0, 1500, 0),
  vel: new THREE.Vector3(0, 0, -200),
  rot: new THREE.Euler(0, 0, 0, 'YXZ'),
  throttle: 0.7,
  pitch: 0, roll: 0, yaw: 0,
  speed: 450,
  hp: 100,
  gunAmmo: 800,
  missiles: 4,
};

const tuning = {
  maxThrust: 80000,
  drag: 0.015,
  pitchRate: 55,
  rollRate: 120,
  yawRate: 25,
  stallSpeed: 140,
  stallAssist: 0.35,
  maxSpeed: 850,
  minSpeed: 120,
  gunProjectileSpeed: 900,
};

const enemies = [];
const sams = [];
const tracers = [];
const sparks = [];
const keys = {};

const mission = {
  timeLimit: MISSION.timeLimitSeconds,
  elapsed: 0,
  active: false,
  objectives: MISSION.objectives.map(o => ({ ...o })),
  radioPlayed: new Set(),
};

let lockState = 'searching';
let lockProgress = 0;
let lockTarget = null;
let samAlertTimer = 0;
let prevLockState = 'searching';

// Web Audio — lock tones
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
  if (state === 'locked') { playTone(1200, 0.08, 'square', 0.06); playTone(1600, 0.1, 'sine', 0.05); }
  if (state === 'missile') { playTone(400, 0.15, 'sawtooth', 0.1); playTone(300, 0.15, 'sawtooth', 0.08); }
}

function knotsToUnits(k) { return k * 0.514444 * 8; }

function getForward() {
  return new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion().setFromEuler(player.rot));
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
  return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight };
}

function spawnWorld() {
  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(5000, 10000, 3000);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x6688aa, 0.5));

  const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(80000, 80000),
    new THREE.MeshStandardMaterial({ color: 0x1a4a6e, roughness: 0.2 })
  );
  ocean.rotation.x = -Math.PI / 2;
  scene.add(ocean);

  for (let i = 0; i < 8; i++) {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(200 + Math.random() * 300, 80 + Math.random() * 200, 200),
      new THREE.MeshStandardMaterial({ color: 0x888899 })
    );
    b.position.set(-2000 + i * 400, 40, -3000 + (i % 3) * 500);
    scene.add(b);
  }

  for (let i = 0; i < 2; i++) enemies.push(createEnemy(3000 + i * 1500, 1200 + i * 200, -4000 - i * 800));
  for (let i = 0; i < 3; i++) sams.push(createSAM(-1500 + i * 900, 0, -2500 - i * 400));
}

function createEnemy(x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(80, 200, 6),
    new THREE.MeshStandardMaterial({ color: 0xaa3333 })
  );
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.userData = { type: 'air', hp: 60, alive: true, vel: new THREE.Vector3() };
  scene.add(mesh);
  return mesh;
}

function createSAM(x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(60, 80, 40, 8),
    new THREE.MeshStandardMaterial({ color: 0x556b2f })
  );
  mesh.position.set(x, y + 20, z);
  mesh.userData = { type: 'ground', hp: 40, alive: true, fireTimer: 0 };
  scene.add(mesh);
  return mesh;
}

function updateFlight(dt) {
  player.rot.x += player.pitch * THREE.MathUtils.degToRad(tuning.pitchRate) * dt;
  player.rot.z += player.roll * THREE.MathUtils.degToRad(tuning.rollRate) * dt;
  player.rot.y += player.yaw * THREE.MathUtils.degToRad(tuning.yawRate) * dt;

  if (player.speed < tuning.stallSpeed) {
    player.rot.x -= tuning.stallAssist * THREE.MathUtils.degToRad(tuning.pitchRate) * dt;
  }
  player.rot.x = THREE.MathUtils.clamp(player.rot.x, -Math.PI / 3, Math.PI / 3);

  const q = new THREE.Quaternion().setFromEuler(player.rot);
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
  player.pos.y = Math.max(100, player.pos.y);
  player.vel.copy(forward).multiplyScalar(newSpeedUnits);
}

function updateEnemies(dt) {
  for (const e of enemies) {
    if (!e.userData.alive) continue;
    const dir = player.pos.clone().sub(e.position).normalize();
    e.userData.vel.copy(dir).multiplyScalar(knotsToUnits(350));
    const targetQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir);
    e.quaternion.slerp(targetQ, dt * 0.8);
    e.position.addScaledVector(dir, knotsToUnits(350) * dt);
  }
}

function updateSAMs(dt) {
  for (const s of sams) {
    if (!s.userData.alive) continue;
    s.userData.fireTimer += dt;
    const dist = s.position.distanceTo(player.pos) / 100;
    if (dist < 8000 && s.userData.fireTimer > 5) {
      player.hp -= 8;
      s.userData.fireTimer = 0;
      samAlertTimer = 1.2;
      playLockTone('missile');
      flashMsg('SAM HIT', '#ff6666');
    }
  }
}

function updateLock(dt) {
  let best = null, bestDist = Infinity;
  const fwd = getForward();
  for (const e of enemies) {
    if (!e.userData.alive) continue;
    const dist = e.position.distanceTo(player.pos);
    const toE = e.position.clone().sub(player.pos).normalize();
    if (fwd.dot(toE) > 0.86 && dist < 500000 && dist < bestDist) {
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
    if (lockProgress >= 1) lockState = 'locked';
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
    const rangeM = best.position.distanceTo(player.pos) / 100;
    label.textContent = `${Math.round(rangeM)}m`;
  }
}

function spawnTracer(from, to) {
  tracers.push({ from: from.clone(), to: to.clone(), life: 0.12 });
}

function spawnSpark(pos) {
  sparks.push({ pos: pos.clone(), life: 0.25 });
}

function fireGun() {
  if (player.gunAmmo <= 0) return;
  player.gunAmmo--;
  playTone(120, 0.04, 'sawtooth', 0.03);
  const fwd = getForward();
  const muzzle = player.pos.clone().addScaledVector(fwd, 80);
  let hitPoint = muzzle.clone().addScaledVector(fwd, 2000);

  for (const list of [enemies, sams]) {
    for (const t of list) {
      if (!t.userData.alive) continue;
      const toT = t.position.clone().sub(player.pos);
      if (toT.length() > 200000) continue;
      toT.normalize();
      const lead = t.userData.vel ? computeLeadPoint(t.position, t.userData.vel) : t.position;
      const toLead = lead.clone().sub(player.pos).normalize();
      if (fwd.dot(toLead) > 0.97) {
        t.userData.hp -= 12;
        hitPoint = t.position.clone();
        spawnSpark(t.position);
        if (t.userData.hp <= 0) destroyTarget(t);
      }
    }
  }
  spawnTracer(muzzle, hitPoint);
}

function fireMissile() {
  if (player.missiles <= 0 || lockState !== 'locked' || !lockTarget) return;
  player.missiles--;
  playTone(200, 0.2, 'sawtooth', 0.07);
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
  const obj = mission.objectives.find(o => o.type === t.userData.type && !o.done);
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
  if (mission.objectives.every(o => o.done)) {
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
  for (const line of MISSION.radio) {
    if (mission.elapsed >= line.at && !mission.radioPlayed.has(line.at)) {
      mission.radioPlayed.add(line.at);
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
  document.getElementById('spd-val').textContent = Math.round(player.speed);
  document.getElementById('alt-val').textContent = Math.round(player.pos.y * 3.28);
  document.getElementById('weapon-panel').innerHTML =
    `VULCAN-20 <b>${player.gunAmmo}</b><br>SKR-IR <b>${player.missiles}</b><br><span style="color:${lockState === 'locked' ? '#ff6666' : '#ffd166'}">LOCK ${lockState.toUpperCase()}</span>`;

  document.getElementById('objectives').innerHTML =
    mission.objectives.map(o => `${o.done ? '✓' : '○'} ${o.label} (${o.count}/${o.need})`).join('<br>');
  document.getElementById('timer').textContent = `T-${formatTime(mission.timeLimit - mission.elapsed)}`;

  const heading = ((THREE.MathUtils.radToDeg(player.rot.y) % 360) + 360) % 360;
  const strip = document.getElementById('compass-strip');
  strip.style.left = `${-heading * (40 / 10) + 210}px`;

  const radar = document.getElementById('radar');
  radar.querySelectorAll('.blip').forEach(b => b.remove());
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

  const alert = document.getElementById('alert');
  alert.classList.toggle('show', samAlertTimer > 0);
}

function addBlip(radar, entity, isGround) {
  const rel = entity.position.clone().sub(player.pos);
  const blip = document.createElement('div');
  blip.className = 'blip' + (isGround ? ' ground' : '');
  blip.style.left = `${50 + rel.x / 200}%`;
  blip.style.top = `${50 + rel.z / 200}%`;
  radar.appendChild(blip);
}

function formatTime(s) {
  s = Math.max(0, Math.floor(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function updateCamera() {
  const q = new THREE.Quaternion().setFromEuler(player.rot);
  const back = new THREE.Vector3(0, 0.15, 1).applyQuaternion(q).multiplyScalar(1200);
  camera.position.copy(player.pos).add(back).add(new THREE.Vector3(0, 200, 0));
  camera.lookAt(player.pos.clone().add(new THREE.Vector3(0, 0, -1).applyQuaternion(q).multiplyScalar(500)));
}

function updateVFX(dt) {
  for (let i = tracers.length - 1; i >= 0; i--) {
    tracers[i].life -= dt;
    if (tracers[i].life <= 0) tracers.splice(i, 1);
  }
  for (let i = sparks.length - 1; i >= 0; i--) {
    sparks[i].life -= dt;
    if (sparks[i].life <= 0) sparks.splice(i, 1);
  }
}

function drawVFX() {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  // Tracers drawn via Three.js overlay would need second pass; use DOM-free approach with line segments in scene
}

function restart() {
  player.pos.set(0, 1500, 0);
  player.speed = 450;
  player.hp = 100;
  player.gunAmmo = 800;
  player.missiles = 4;
  mission.elapsed = 0;
  mission.active = true;
  mission.radioPlayed.clear();
  mission.objectives.forEach(o => { o.count = 0; o.done = false; });
  lockState = 'searching';
  prevLockState = 'searching';
  lockProgress = 0;
  document.getElementById('msg').classList.remove('show');
  document.getElementById('debrief').style.display = 'none';
  document.getElementById('hud').style.display = 'block';
  for (const e of enemies) scene.remove(e);
  for (const s of sams) scene.remove(s);
  enemies.length = 0;
  sams.length = 0;
  for (let i = 0; i < 2; i++) enemies.push(createEnemy(3000 + i * 1500, 1200, -4000 - i * 800));
  for (let i = 0; i < 3; i++) sams.push(createSAM(-1500 + i * 900, 0, -2500 - i * 400));
}

function startMission() {
  document.getElementById('briefing').style.display = 'none';
  document.getElementById('hud').style.display = 'block';
  mission.active = true;
  ensureAudio();
}

// Briefing setup
document.getElementById('brief-objs').innerHTML = MISSION.objectives
  .map(o => `<li>${o.label} × ${o.need}</li>`).join('');
document.getElementById('startBtn').addEventListener('click', startMission);
document.getElementById('retryBtn').addEventListener('click', () => { restart(); startMission(); });

addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space') fireGun();
  if (e.code === 'KeyF') fireMissile();
  if (e.code === 'KeyR') restart();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

buildCompass();
spawnWorld();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (mission.active) {
    player.throttle = THREE.MathUtils.clamp(player.throttle + (keys.KeyW ? 1 : keys.KeyS ? -1 : 0) * dt * 0.5, 0.2, 1);
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

  updateCamera();
  updateHUD();
  renderer.render(scene, camera);
}
animate();
