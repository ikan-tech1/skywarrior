# SkyWarrior

Original arcade military flight combat game — Ace Combat–class feel, indie scope, Unreal Engine 5.5 C++ core.

**IP:** Free Meridian Coalition vs Ashford Directorate. Player: **Lt. Kai Ren**, Viper Squadron.

**Repository:** [github.com/ikan-tech1/skywarrior](https://github.com/ikan-tech1/skywarrior)

**Live demo (web prototype):** [skywarrior.vercel.app](https://skywarrior.vercel.app)

---

## Quick start (no UE required)

Play the **web flight prototype** for M01 "First Light" loop:

```bash
cd prototype/web-flight
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) — click **LAUNCH SORTIE** on the briefing card to start.

You should see your VF-1 jet in third-person chase view over ocean, coast, and Port Kestrel landmarks (not a flat blue void).

| Control | Action |
|---------|--------|
| W / S | Throttle up / down |
| ↑ / ↓ | Pitch |
| A / D | Roll |
| Q / E | Yaw |
| Space | Gun (Vulcan-20) |
| F | IR missile (when locked) |
| R | Restart mission |

**Objective:** Destroy 2 fighters + 3 SAM sites within 10 minutes.

---

## Unreal Engine build (when UE 5.5 installed)

See **`docs/UE5_SETUP.md`** for full install and compile steps.

```bash
open SkyWarrior.uproject
```

First launch: allow module compile. Create map `Content/Maps/FlightTuning` per `Content/Maps/FlightTuning.README.md`.

**Default GameMode:** `ASkyWarriorGameMode` → `APlayerAircraft`

---

## Repository layout

```
docs/                  Design docs, roadmap, acceptance tests
Source/SkyWarrior/     C++ modules
  Flight/              PlayerAircraft, FlightDynamicsComponent
  Weapons/             WeaponManager, TargetingComponent, damage
  AI/                  EnemyFighter, SAMSite, WingmanController
  Mission/             MissionSubsystem, triggers, ace actors
  UI/                  CombatHUDWidget
  Meta/                HangarSubsystem, save game, replay stub
  Audio/               RadioSubsystem
Content/
  Missions/            JSON mission definitions (mod-friendly)
  Maps/                Theater maps (create in editor)
  AI/                  Behavior tree placeholders
prototype/web-flight/  Three.js vertical slice demo
```

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [GDD](docs/GDD.md) | Design north star and pillars |
| [FEATURE_MATRIX](docs/FEATURE_MATRIX.md) | P0/P1/P2 parity checklist |
| [IMPROVEMENT_PLAN](docs/IMPROVEMENT_PLAN.md) | Prioritized improvement backlog |
| [IP_BIBLE](docs/IP_BIBLE.md) | Nations, squadrons, aces, 8-mission outline |
| [FLIGHT_ACCEPTANCE](docs/FLIGHT_ACCEPTANCE.md) | Five maneuver drills |
| [UE5_SETUP](docs/UE5_SETUP.md) | Engine install and compile |
| [IMPROVEMENT_PLAN](docs/IMPROVEMENT_PLAN.md) | Prioritized parity backlog (P0/P1/P2) |
| [RISK_REGISTER](docs/RISK_REGISTER.md) | Project risks |

---

## Phase status

| Phase | Status |
|-------|--------|
| 0 Preproduction | Docs + scaffold + web prototype |
| 1 Vertical slice | C++ stubs; PIE blocked on UE |
| 2 Mission OS | Subsystem skeleton |
| 3 Hangar | Subsystem skeleton |
| 4 Campaign | Pipeline docs + ace stub |
| 5 MP/Polish | Documented in ROADMAP (P2) |

---

## License

Original IP. Engine: Unreal Engine EULA when using UE5.
