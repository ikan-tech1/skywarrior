# SkyWarrior Web Flight Prototype

Browser vertical slice for **M01 — First Light**. Deployed at [skywarrior.vercel.app](https://skywarrior.vercel.app).

## Run locally

```bash
python3 -m http.server 8080
```

Open http://localhost:8080 and click **LAUNCH SORTIE**.

## Controls

| Key | Action |
|-----|--------|
| W / S | Throttle up / down |
| ↑ / ↓ | Pitch |
| A / D | Roll |
| Q / E | Yaw |
| Space | Gun (Vulcan-20) |
| F | IR missile (requires lock) |
| R | Restart mission |

## What you should see

- Third-person chase camera behind your VF-1 jet mesh
- Gradient sky, ocean, green coast, Port Kestrel harbor blocks
- Red hostile fighters and orange SAM blips on radar
- AC-style HUD: compass, speed/alt tapes, lock box, lead pip

## Deploy

Vercel serves `prototype/web-flight` per root `vercel.json`. Use relative `./main.js` and `./missions/*.json` paths.
