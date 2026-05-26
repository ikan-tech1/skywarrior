# SkyWarrior — Roadmap

Phased delivery for an indie Ace Combat–class arcade flight combat game. See `docs/GDD.md` and `docs/FEATURE_MATRIX.md` for scope.

---

## Phase 0 — Preproduction ✅ (this session)

| Deliverable | Path | Status |
|-------------|------|--------|
| GDD | `docs/GDD.md` | Done |
| Feature matrix P0/P1/P2 | `docs/FEATURE_MATRIX.md` | Done |
| IP bible | `docs/IP_BIBLE.md` | Done |
| Flight acceptance drills | `docs/FLIGHT_ACCEPTANCE.md` | Done |
| Risk register | `docs/RISK_REGISTER.md` | Done |
| UE5 setup guide | `docs/UE5_SETUP.md` | Done |
| C++ module scaffold | `Source/SkyWarrior/` | Done |
| Web flight prototype | `prototype/web-flight/` | Done |

**Blocker:** UE5 not installed — compile verification deferred.

---

## Phase 1 — Vertical slice 🚧

| Item | Status |
|------|--------|
| `APlayerAircraft` + chase camera | Stub complete |
| `UFlightDynamicsComponent` arcade tuning | Stub complete |
| Gun hitscan + Seeker-IR lock FSM | Stub complete |
| `AEnemyFighter` + `ASAMSite` | Stub complete |
| `UCombatHUDWidget` | Stub complete |
| Mission M01 JSON + win condition | Done |
| Enhanced Input assets in editor | **Needs UE editor** |
| FlightTuning map | **Needs UE editor** |
| Playable PIE loop | **Blocked on UE install** |

**Exit:** Repeatable 10-min M01 loop at 60 FPS.

---

## Phase 2 — Mission operating system 🚧

| Item | Path | Status |
|------|------|--------|
| `UMissionSubsystem` | `Mission/MissionSubsystem.*` | Skeleton |
| Checkpoints | `SetCheckpoint`, `MissionTrigger` | Skeleton |
| Rank calculator | `CalculateRank()` | Stub |
| Briefing/debrief UI | `Content/UI/` | Not started |
| 5 mission templates | `Content/Missions/` | M01 only |
| Wingman commands | `AI/WingmanController.*` | Skeleton |
| Behavior trees | `Content/AI/BT_PLACEHOLDER.md` | Placeholder |

---

## Phase 3 — Hangar and progression 🚧

| Item | Path | Status |
|------|------|--------|
| `UAircraftSpec` data assets | `Meta/AircraftSpec.h` | Header only |
| `UHangarSubsystem` | `Meta/HangarSubsystem.*` | Skeleton |
| `USkyWarriorSaveGame` | `Meta/SkyWarriorSaveGame.h` | Skeleton |
| Loadout select UI | — | Not started |
| Mission select grid | — | Not started |

---

## Phase 4 — Campaign content pipeline 🚧

| Item | Path | Status |
|------|------|--------|
| 8-mission outline | `docs/IP_BIBLE.md` | Documented |
| Ace actors | `Mission/CampaignAceActor.*` | Skeleton |
| Radio pipeline | `Audio/RadioSubsystem.*` | Skeleton |
| Sequencer cutscenes | — | Not started |
| Full VO | — | Not started |

See `docs/CAMPAIGN_PIPELINE.md` for content workflow.

---

## Phase 5 — Multiplayer and polish ⏸️ (P2)

| Item | Priority | Notes |
|------|----------|-------|
| 8–16 player dogfight | P2 | Dedicated server; server-auth weapons |
| EOS / Steam networking | P2 | Evaluate after solo loop proven |
| Co-op campaign | P2 | Optional differentiator |
| **Mod-friendly missions** | P1/P2 | JSON schema in `Content/Missions/` |
| **Replay system** | P2 | `Meta/ReplayRecorder.*` stub |
| **Ultrawide HUD** | P2 | Common UI safe zones |
| Photo mode | P2 | — |
| HDR / Steam Deck | P2 | — |

---

## Recommended next actions

1. Install UE 5.5 (`docs/UE5_SETUP.md`)
2. Open `SkyWarrior.uproject`, compile, create `FlightTuning` map
3. Run flight acceptance drills (`docs/FLIGHT_ACCEPTANCE.md`)
4. Create Enhanced Input assets wired to `APlayerAircraft`
5. Blueprint subclass `UCombatHUDWidget` for radar/lock visuals
6. Playtest M01 in PIE; tune `UFlightDynamicsComponent` defaults

---

## Multiplayer architecture notes (Phase 5)

- **Movement:** replicate transform + compressed velocity; client prediction on player pawn
- **Weapons:** server-authoritative hitscan and missile spawn
- **Missions:** not replicated in v1 dogfight; co-op requires `UMissionSubsystem` host authority
- **Backend:** Epic Online Services or Steam Networking SDK
- **Target:** 60 Hz tick, 8 players minimum viable dogfight arena
