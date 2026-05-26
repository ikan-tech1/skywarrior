import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87a8cb);
scene.fog = new THREE.Fog(0x87a8cb, 2000, 25000);

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 1, 50000);
const clock = new THREE.Clock();

// Player state — arcade tuning mirrors UFlightDynamicsComponent defaults
const player = {
  pos: new THREE.Vector3(0, 1500, 0),
  vel: new THREE.Vector3(0, 0, -200),
  rot: new THREE.Euler(0, 0, 0, 'YXZ'),
  throttle: 0.7,
  pitch: 0, roll: 0, yaw: 0,
  speed: 450, // knots equivalent scale
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
};

const enemies = [];
const sams = [];
const keys = {};

// Mission M01
const mission = {
  timeLimit: 600,
  elapsed: 0,
  active: true,
  objectives: [
    { type: 'air', label: 'Destroy fighters', need: 2, count: 0, done: false },
    { type: 'ground', label: 'Destroy SAM sites', need: 3, count: 0, done: false },
  ],
};

let lockState = 'searching';
let lockProgress = 0;
let lockTarget = null;

function knotsToUnits(k) { return k * 0.514444 * 8; }

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
  ocean.position.y = 0;
  scene.add(ocean);

  // Port Kestrel placeholder blocks
  for (let i = 0; i < 8; i++) {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(200 + Math.random() * 300, 80 + Math.random() * 200, 200),
      new THREE.MeshStandardMaterial({ color: 0x888899 })
    );
    b.position.set(-2000 + i * 400, 40, -3000 + (i % 3) * 500);
    scene.add(b);
  }

  for (let i = 0; i < 2; i++) {
    enemies.push(createEnemy(3000 + i * 1500, 1200 + i * 200, -4000 - i * 800));
  }
  for (let i = 0; i < 3; i++) {
    sams.push(createSAM(-1500 + i * 900, 0, -2500 - i * 400));
  }
}

function createEnemy(x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(80, 200, 6),
    new THREE.MeshStandardMaterial({ color: 0xaa3333 })
  );
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.userData = { type: 'air', hp: 60, alive: true };
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
  const speedUnits = knotsToUnits(player.speed);
  player.rot.x += player.pitch * THREE.MathUtils.degToRad(tuning.pitchRate) * dt;
  player.rot.z += player.roll * THREE.MathUtils.degToRad(tuning.rollRate) * dt;
  player.rot.y += player.yaw * THREE.MathUtils.degToRad(tuning.yawRate) * dt;

  if (player.speed < tuning.stallSpeed) {
    player.rot.x -= tuning.stallAssist * THREE.MathUtils.degToRad(tuning.pitchRate) * dt;
  }

  player.rot.x = THREE.MathUtils.clamp(player.rot.x, -Math.PI / 3, Math.PI / 3);

  const q = new THREE.Quaternion().setFromEuler(player.rot);
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q);

  const thrust = tuning.maxThrust * player.throttle;
  const drag = tuning.drag * speedUnits * speedUnits;
  const accel = (thrust - drag) / 15000;
  const newSpeedUnits = THREE.MathUtils.clamp(speedUnits + accel * dt, knotsToUnits(tuning.minSpeed), knotsToUnits(tuning.maxSpeed));
  player.speed = newSpeedUnits / (0.514444 * 8);

  player.pos.addScaledVector(forward, newSpeedUnits * dt);
  player.pos.y = Math.max(100, player.pos.y);
}

function updateEnemies(dt) {
  for (const e of enemies) {
    if (!e.userData.alive) continue;
    const dir = player.pos.clone().sub(e.position).normalize();
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
      flashMsg('SAM HIT', '#ff6666');
    }
  }
}

function updateLock(dt) {
  let best = null, bestDist = Infinity;
  for (const e of enemies) {
    if (!e.userData.alive) continue;
    const dist = e.position.distanceTo(player.pos);
    const toE = e.position.clone().sub(player.pos).normalize();
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion().setFromEuler(player.rot));
    if (fwd.dot(toE) > 0.86 && dist < 500000 && dist < bestDist) {
      bestDist = dist;
      best = e;
    }
  }

  const box = document.getElementById('lockBox');
  if (!best) {
    lockState = 'searching';
    lockProgress = 0;
    lockTarget = null;
    box.className = 'lock-box';
    return;
  }

  lockTarget = best;
  if (lockState !== 'locked') {
    lockState = 'tracking';
    lockProgress += dt;
    if (lockProgress >= 1) lockState = 'locked';
  }
  box.className = 'lock-box ' + (lockState === 'locked' ? 'locked' : 'tracking');
}

function fireGun() {
  if (player.gunAmmo <= 0) return;
  player.gunAmmo--;
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion().setFromEuler(player.rot));
  for (const list of [enemies, sams]) {
    for (const t of list) {
      if (!t.userData.alive) continue;
      const toT = t.position.clone().sub(player.pos);
      if (toT.length() > 200000) continue;
      toT.normalize();
      if (fwd.dot(toT) > 0.98) {
        t.userData.hp -= 12;
        if (t.userData.hp <= 0) destroyTarget(t);
      }
    }
  }
}

function fireMissile() {
  if (player.missiles <= 0 || lockState !== 'locked' || !lockTarget) return;
  player.missiles--;
  destroyTarget(lockTarget);
  lockState = 'searching';
  lockProgress = 0;
  lockTarget = null;
}

function destroyTarget(t) {
  if (!t.userData.alive) return;
  t.userData.alive = false;
  t.visible = false;
  const obj = mission.objectives.find(o => o.type === t.userData.type && !o.done);
  if (obj) {
    obj.count++;
    if (obj.count >= obj.need) obj.done = true;
  }
  checkWin();
}

function checkWin() {
  if (mission.objectives.every(o => o.done)) {
    mission.active = false;
    flashMsg('MISSION COMPLETE', '#66ff99');
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

function updateHUD() {
  document.getElementById('flight').innerHTML =
    `SPD ${Math.round(player.speed)} KT<br>ALT ${Math.round(player.pos.y * 3.28)} FT<br>HP ${Math.round(player.hp)}`;
  document.getElementById('weapon').innerHTML =
    `VULCAN-20 ${player.gunAmmo}<br>SKR-IR ${player.missiles}<br>LOCK ${lockState.toUpperCase()}`;
  document.getElementById('objectives').innerHTML =
    mission.objectives.map(o => `${o.done ? '✓' : '○'} ${o.label} (${o.count}/${o.need})`).join('<br>') +
    `<br><span class="timer">T-${formatTime(mission.timeLimit - mission.elapsed)}</span>`;

  const radar = document.getElementById('radar');
  radar.querySelectorAll('.blip').forEach(b => b.remove());
  for (const e of enemies) {
    if (!e.userData.alive) continue;
    const rel = e.position.clone().sub(player.pos);
    const blip = document.createElement('div');
    blip.className = 'blip';
    blip.style.left = `${50 + rel.x / 200}%`;
    blip.style.top = `${50 + rel.z / 200}%`;
    radar.appendChild(blip);
  }
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

function restart() {
  player.pos.set(0, 1500, 0);
  player.speed = 450;
  player.hp = 100;
  player.gunAmmo = 800;
  player.missiles = 4;
  mission.elapsed = 0;
  mission.active = true;
  mission.objectives.forEach(o => { o.count = 0; o.done = false; });
  document.getElementById('msg').classList.remove('show');
  scene.remove(...enemies, ...sams);
  enemies.length = 0;
  sams.length = 0;
  for (let i = 0; i < 2; i++) enemies.push(createEnemy(3000 + i * 1500, 1200, -4000 - i * 800));
  for (let i = 0; i < 3; i++) sams.push(createSAM(-1500 + i * 900, 0, -2500 - i * 400));
}

addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'Space') fireGun(); if (e.code === 'KeyF') fireMissile(); if (e.code === 'KeyR') restart(); });
addEventListener('keyup', e => keys[e.code] = false);
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

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
    mission.elapsed += dt;
    checkFail();
  }

  updateCamera();
  updateHUD();
  renderer.render(scene, camera);
}
animate();
