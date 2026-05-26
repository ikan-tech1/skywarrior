# SkyWarrior — Unreal Engine 5 Setup

**Status:** UE5 is **not currently installed** on this machine. The repo contains a complete C++ project skeleton and config that activates once UE 5.5+ is installed.

---

## Requirements

| Component | Version |
|-----------|---------|
| Unreal Engine | **5.5** or later |
| Visual Studio (Windows) or Xcode (macOS) | VS 2022 / Xcode 15+ |
| Platform | PC first (Win64 / Mac) |

**Documented min spec (playtest target):**  
GTX 1060 / RX 580, 16 GB RAM, SSD, 1080p @ 60 FPS.

---

## Install Unreal Engine 5.5

### macOS (this machine)

1. Install [Epic Games Launcher](https://store.epicgames.com/en-US/download)
2. Sign in → **Unreal Engine** tab → **Install Engine**
3. Select **5.5.x** (or latest 5.x)
4. Optional modules: **Mac**, **Win64** (if cross-compiling)

### Windows

Same via Epic Launcher; install **Visual Studio 2022** with:
- Desktop development with C++
- Game development with C++ (optional workload)
- Windows 10/11 SDK

---

## Open the project

```bash
# macOS — after engine install, associate .uproject with UE 5.5
open /Users/eashangupta/Projects/skywarrior/SkyWarrior.uproject
```

First open prompts **Rebuild SkyWarrior modules** — accept.

Or from terminal (adjust engine path):

```bash
"/Users/Shared/Epic Games/UE_5.5/Engine/Build/BatchFiles/Mac/GenerateProjectFiles.sh" \
  -project="/Users/eashangupta/Projects/skywarrior/SkyWarrior.uproject" -game -engine
```

---

## Generate IDE project

**macOS / Xcode:**

```bash
/Users/Shared/Epic\ Games/UE_5.5/Engine/Build/BatchFiles/Mac/GenerateProjectFiles.sh \
  -project="$PWD/SkyWarrior.uproject" -game
open SkyWarrior.xcworkspace
```

**Windows:**

Right-click `SkyWarrior.uproject` → **Generate Visual Studio project files**.

---

## Build from command line

```bash
# macOS Editor build
"/Users/Shared/Epic Games/UE_5.5/Engine/Build/BatchFiles/RunUAT.sh" BuildCookRun \
  -project="$PWD/SkyWarrior.uproject" -platform=Mac -clientconfig=Development -build
```

Headless compile check:

```bash
"/Users/Shared/Epic Games/UE_5.5/Engine/Build/BatchFiles/Mac/Build.sh" \
  SkyWarriorEditor Mac Development \
  -project="$PWD/SkyWarrior.uproject"
```

---

## First-run checklist

1. Open `Content/Maps/FlightTuning` (create in editor if placeholder only)
2. Set **GameMode** to `ASkyWarriorGameMode`
3. Place **PlayerStart** + assign default pawn `APlayerAircraft`
4. **Edit → Project Settings → Input** — verify Enhanced Input mapping contexts:
   - `IMC_SkyWarrior_Default` (gamepad + keyboard placeholders in `Config/`)
5. Play in Editor (PIE) — run flight acceptance drills (`docs/FLIGHT_ACCEPTANCE.md`)

---

## Module layout

```
Source/SkyWarrior/
  Flight/       PlayerAircraft, FlightDynamicsComponent
  Weapons/      WeaponManager, TargetingComponent, WeaponDefinition
  AI/           EnemyFighter, SAMSite
  Mission/      MissionSubsystem, MissionData
  UI/           CombatHUDWidget
  Meta/         HangarSubsystem, SaveGame, ReplayRecorder
  Audio/        RadioSubsystem
```

---

## Content paths

| Path | Purpose |
|------|---------|
| `Content/Maps/FlightTuning` | Flight tuning empty map |
| `Content/Missions/` | JSON mission definitions |
| `Content/Aircraft/` | UAircraftSpec data assets (editor) |
| `Content/UI/` | Widget Blueprints (HUD) |

---

## Blocker workaround — web flight prototype

Until UE is installed, run the standalone Three.js prototype:

```bash
cd prototype/web-flight
python3 -m http.server 8080
# Open http://localhost:8080
```

Controls: **W/S** throttle, **A/D** roll, **↑/↓** pitch, **Q/E** yaw, **Space** fire gun, **F** missile (when locked), **Mouse** look (optional).

This validates arcade feel drills 1–2 approximately; migrate tuning to `UFlightDynamicsComponent` when UE is available.

---

## CI (future)

- Build `SkyWarriorEditor` on push (self-hosted Mac/Win agent with UE)
- Run automation tests in `Source/SkyWarriorTests/` (Phase 2)
- Cook mission JSON schema validation script

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "SkyWarrior could not be compiled" | Regenerate project files; check Xcode CLT |
| Enhanced Input not working | Enable plugin; assign IMC in PlayerController |
| Missing FlightTuning map | Create empty level in editor, save to `Content/Maps/FlightTuning` |
