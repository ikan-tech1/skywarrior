/**
 * SkyWarrior arcade flight prototype — validates Phase 0 feel drills without UE5.
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x6eb5ff);
scene.fog = new THREE.Fog(0x6eb5ff, 800, 12000);

const camera = new THREE.PerspectiveCamera(70, 1, 1, 20000);
const chaseOffset = new THREE.Vector3(0, 80, -280);

const hemi = new THREE.HemisphereLight(0xffffff, 0x446688, 0.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(500, 800, 300);
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20000, 20000),
  new THREE.MeshStandardMaterial({ color: 0x2d5a3d })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const player = new THREE.Group();
const body = new THREE.Mesh(
  new THREE.ConeGeometry(8, 40, 8),
  new THREE.MeshStandardMaterial({ color: 0x4a90a4 })
);
body.rotation.x = Math.PI / 2;
player.add(body);
player.position.set(0, 500, 0);
scene.add(player);

const enemies = [];
const sams = [];
let kills = 0;
const killTarget = 3;

function spawnEnemy(x, z) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(20, 6, 30),
    new THREE.MeshStandardMaterial({ color: 0xaa3333 })
  );
  g.add(m);
  g.position.set(x, 400 + Math.random() * 200, z);
  g.userData = { type: 'air', hp: 60, speed: 120 };
  scene.add(g);
  enemies.push(g);
}

function spawnSAM(x, z) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(8, 12, 20, 6),
    new THREE.MeshStandardMaterial({ color: 0x666666 })
  );
  m.position.y = 10;
  g.add(m);
  g.position.set(x, 0, z);
  g.userData = { type: 'ground', hp: 150 };
  scene.add(g);
  sams.push(g);
}

spawnEnemy(800, -400);
spawnEnemy(-600, 900);
spawnSAM(1200, 600);

const flight = {
  speed: 400,
  throttle: 0.55,
  pitch: 0, roll: 0, yaw: 0,
  thrustMax: 850,
  drag: 0.015,
  pitchRate: 45,
  rollRate: 90,
  yawRate: 25,
  stallKmh: 120,
  stallAssist: 0.6,
};

const input = { pitch: 0, roll: 0, yaw: 0, gun: false, missile: false };
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space') input.gun = true;
  if (e.code === 'KeyF') input.missile = true;
  if (e.code === 'KeyR') reset();
});
window.addEventListener('keyup', e => {
  keys[e.code] = false;
  if (e.code === 'Space') input.gun = false;
});

let lockState = 'none';
let lockProgress = 0;
let lockedTarget = null;
let gunCooldown = 0;
let missiles = 4;

function reset() {
  player.position.set(0, 500, 0);
  player.rotation.set(0, 0, 0);
  flight.speed = 400;
  kills = 0;
  missiles = 4;
  enemies.length = 0;
  sams.length = 0;
  spawnEnemy(800, -400);
  spawnEnemy(-600, 900);
  spawnSAM(1200, 600);
}

function readInput() {
  input.pitch = (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0);
  input.roll = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  input.yaw = (keys.KeyE ? 1 : 0) - (keys.KeyQ ? 1 : 0);
  if (keys.ArrowUp) flight.throttle = Math.min(1, flight.throttle + 0.01);
  if (keys.ArrowDown) flight.throttle = Math.max(0, flight.throttle - 0.01);
}

function integrateFlight(dt) {
  const target = 200 + flight.throttle * 600;
  flight.speed += (target - flight.speed) * 2 * dt;
  flight.speed -= flight.drag * flight.speed * dt;
  flight.speed = Math.max(80, Math.min(900, flight.speed));

  const sf = Math.max(0.4, Math.min(1.2, flight.speed / 450));
  player.rotateX(THREE.MathUtils.degToRad(-input.pitch * flight.pitchRate * sf * dt));
  player.rotateZ(THREE.MathUtils.degToRad(-input.roll * flight.rollRate * sf * dt));
  player.rotateY(THREE.MathUtils.degToRad(-input.yaw * flight.yawRate * sf * dt));

  if (flight.speed < flight.stallKmh) {
    const assist = flight.stallAssist * (1 - flight.speed / flight.stallKmh);
    player.rotateX(THREE.MathUtils.degToRad(assist * 30 * dt));
  }

  const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion);
  player.position.addScaledVector(fwd, flight.speed * 0.2778 * dt);
  player.position.y = Math.max(50, player.position.y);
}

function findLockTarget() {
  const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion);
  let best = null, bestAngle = 8;
  for (const t of [...enemies, ...sams]) {
    const dir = t.position.clone().sub(player.position).normalize();
    const ang = THREE.MathUtils.radToDeg(fwd.angleTo(dir));
    if (ang < bestAngle) { bestAngle = ang; best = t; }
  }
  return best;
}

function updateLock(dt) {
  const t = findLockTarget();
  if (!t) {
    lockState = 'none'; lockProgress = 0; lockedTarget = null; return;
  }
  if (lockedTarget !== t) { lockedTarget = t; lockProgress = 0; lockState = 'searching'; }
  lockProgress = Math.min(1, lockProgress + dt / 2);
  lockState = lockProgress >= 1 ? 'hard' : lockProgress >= 0.5 ? 'soft' : 'searching';
}

function fireGun() {
  if (gunCooldown > 0) return;
  gunCooldown = 0.06;
  const origin = player.position.clone();
  const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion);
  const ray = new THREE.Raycaster(origin, dir, 0, 2500);
  const hits = ray.intersectObjects([...enemies, ...sams], true);
  if (hits.length) {
    let root = hits[0].object;
    while (root.parent && root.parent !== scene) root = root.parent;
    damageTarget(root, 8);
  }
}

function fireMissile() {
  if (lockState !== 'hard' || !lockedTarget || missiles <= 0) return;
  missiles--;
  damageTarget(lockedTarget, 120);
  lockState = 'none'; lockProgress = 0; lockedTarget = null;
}

function damageTarget(obj, amt) {
  if (!obj.userData.hp) return;
  obj.userData.hp -= amt;
  if (obj.userData.hp <= 0) {
    scene.remove(obj);
    const ai = enemies.indexOf(obj);
    if (ai >= 0) enemies.splice(ai, 1);
    const si = sams.indexOf(obj);
    if (si >= 0) sams.splice(si, 1);
    kills++;
  }
}

function updateEnemies(dt) {
  for (const e of enemies) {
    const dir = player.position.clone().sub(e.position).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), dir);
    e.quaternion.slerp(q, dt * 0.8);
    e.position.addScaledVector(dir, e.userData.speed * 0.2778 * dt);
  }
}

function updateHUD() {
  document.getElementById('spd').textContent = Math.round(flight.speed);
  document.getElementById('alt').textContent = Math.round(player.position.y);
  document.getElementById('msl').textContent = missiles;
  document.getElementById('lock').textContent = lockState.toUpperCase();
  document.getElementById('prog').textContent = `${kills}/${killTarget}`;
  const box = document.getElementById('lockBox');
  box.className = 'lock-box' + (lockState === 'soft' ? ' soft' : lockState === 'hard' ? ' hard' : '');
}

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  readInput();
  integrateFlight(dt);
  updateLock(dt);
  updateEnemies(dt);
  if (input.gun) fireGun();
  if (input.missile) { fireMissile(); input.missile = false; }
  gunCooldown = Math.max(0, gunCooldown - dt);

  const back = chaseOffset.clone().applyQuaternion(player.quaternion);
  camera.position.copy(player.position).add(back);
  camera.lookAt(player.position.clone().add(new THREE.Vector3(0,0,200).applyQuaternion(player.quaternion)));

  updateHUD();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

console.log('SkyWarrior flight prototype ready.');
