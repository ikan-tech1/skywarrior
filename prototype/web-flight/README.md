# SkyWarrior Web Flight Prototype

Playable M01 vertical slice (Three.js) deployed at [https://skywarrior.vercel.app](https://skywarrior.vercel.app).

## Controls

| Input | Action |
|-------|--------|
| **W** / **S** | Throttle up / down |
| **↑** / **↓** | Pitch up / down |
| **A** / **D** | Roll left / right |
| **Q** / **E** | Yaw left / right |
| **Space** | Gun (hold or tap) |
| **F** | IR missile (requires lock) |
| **R** | Restart sortie |

1. Click **LAUNCH SORTIE** on the briefing card.
2. Fly toward red hostile fighters; orange ground markers are SAM sites.
3. Hold target in view ~1s for lock, then press **F** for missile or use **Space** for gun.

## Local dev

```bash
cd prototype/web-flight
python3 -m http.server 8765
# open http://127.0.0.1:8765
```

Mission data: `missions/M01_first_light.json`.
