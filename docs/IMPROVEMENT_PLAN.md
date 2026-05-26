# SkyWarrior Improvement Plan

Living backlog cataloging every improvement category vs Ace Combat (mix) parity.  
**Tiers:** P0 = vertical slice / MVP · P1 = mission OS + hangar alpha · P2 = campaign polish + MP

Last updated: 2026-05-26 (urgent web render fix)

---

## Parity snapshot

| Area | P0 rows (FEATURE_MATRIX) | Implemented (est.) | Notes |
|------|--------------------------|--------------------|-------|
| Flight / input | 3 | ~85% | Arcade 6-DOF + chase cam in web + UE |
| Combat / weapons | 3 | ~70% | Gun + IR lock; no tracers in UE yet |
| HUD / UX | 3 | ~55% | Basic panels; missing lead, compass, alerts |
| Mission | 2 | ~40% | JSON loader + web M01; no briefing UI in UE |
| Metagame | 1 | ~15% | Hangar stub only |
| World / VFX | 2 | ~45% | Web sky dome, coast, clouds, jet mesh |
| Audio | 1 | ~30% | Lock tone stub this iteration |
| Engineering | 2 | ~35% | Lock math helpers + script tests |

**Overall P0 parity (weighted): ~52%** → target 65% after iteration 1 P0 push.

---

## 1. Flight feel

| ID | Item | Tier | Status | Action |
|----|------|------|--------|--------|
| FF-01 | Arcade 6-DOF with stall assist | P0 | ✅ Done | Tune curves in `FlightDynamicsComponent` + web mirror |
| FF-02 | Generous energy / recoverable stalls | P0 | ✅ Done | Stall assist active below 140 kt |
| FF-03 | Post-stall maneuvers (AC7-style) | P1 | ⬜ | State machine + stamina cooldown |
| FF-04 | Speed brake / flaps per aircraft | P1 | ⬜ | Data-driven from `UAircraftSpec` |
| FF-05 | Chase camera lag + FOV punch | P0 | 🔶 | Web chase cam lag added; UE spring arm |
| FF-06 | Cockpit camera toggle | P1 | ⬜ | Per-aircraft interior mesh |
| FF-07 | Gamepad rumble on stall / hit | P2 | ⬜ | Enhanced Input haptics |
| FF-08 | HOTAS full rebind UI | P1 | ⬜ | Settings screen |
| FF-09 | Flight acceptance drills automated | P0 | 🔶 | `FLIGHT_ACCEPTANCE.md` manual only |
| FF-10 | Mid-mission RTB / resupply | P2 | ⬜ | Optional mission type |

---

## 2. Combat and weapons

| ID | Item | Tier | Status | Action |
|----|------|------|--------|--------|
| CW-01 | Gun hitscan + damage | P0 | ✅ Done | `WeaponManager::FireGun` |
| CW-02 | Gun lead indicator | P0 | 🔶 | Web lead pip this iter; UE `LockMath` |
| CW-03 | Tracers + hit sparks VFX | P0 | ✅ Done | Web Line tracers + spark meshes |
| CW-04 | IR missile + lock pipeline | P0 | ✅ Done | 1s lock, cone check |
| CW-05 | Lock tone (tracking vs locked) | P0 | 🔶 | Web Audio + UE delegate hook |
| CW-06 | Radar / SEAD lock modes | P1 | ⬜ | Extend `UTargetingComponent` |
| CW-07 | Special weapons (6 archetypes) | P1 | ⬜ | `UWeaponDefinition` roster |
| CW-08 | Multi-lock / swarm missiles | P2 | ⬜ | N-target pipeline |
| CW-09 | Flares / chaff (simplified ECM) | P1 | ⬜ | Break lock + reacquire timer |
| CW-10 | Critical components (SAM radar) | P1 | ⬜ | Sub-target damage |
| CW-11 | Boss / superweapon phases | P2 | ⬜ | `ABossActor` |
| CW-12 | Gun-first TTK tuning pass | P0 | ⬜ | Playtest vs AC7 reference clips |

---

## 3. HUD and UX

| ID | Item | Tier | Status | Action |
|----|------|------|--------|--------|
| HU-01 | Speed + altitude tape | P0 | 🔶 | Web tapes this iter |
| HU-02 | Compass heading band | P0 | 🔶 | Web compass strip |
| HU-03 | Circular radar + blips | P0 | ✅ Done | Web + widget stub |
| HU-04 | Target box + distance | P0 | 🔶 | Web lock box + range |
| HU-05 | Weapon status panel | P0 | ✅ Done | Gun/missile counts |
| HU-06 | Objective list + T-minus timer | P0 | ✅ Done | M01 objectives |
| HU-07 | Missile / damage alerts | P0 | 🔶 | SAM warning flash this iter |
| HU-08 | Radio subtitles + speaker tags | P1 | 🔶 | Web radio lines from JSON |
| HU-09 | Pause mission map | P2 | ⬜ | 2D overlay |
| HU-10 | Ultrawide-safe HUD anchors | P1 | 🔶 | CSS grid margins |
| HU-11 | Briefing card pre-sortie | P0 | 🔶 | Web briefing overlay |
| HU-12 | Debrief rank S–D | P1 | 🔶 | Web rank on win this iter |

---

## 4. Missions and campaign

| ID | Item | Tier | Status | Action |
|----|------|------|--------|--------|
| MS-01 | JSON mission definitions | P0 | ✅ Done | `Content/Missions/*.json` |
| MS-02 | MissionSubsystem load/start | P0 | ✅ Done | Parse + timer + win/fail |
| MS-03 | Briefing screen (map + VO) | P1 | ⬜ | UMG + Sequencer stub |
| MS-04 | Checkpoints + retry | P1 | ⬜ | `SetCheckpoint` exists |
| MS-05 | Debrief + rank calculator | P1 | 🔶 | Rank math in subsystem |
| MS-06 | 5 mission templates | P1 | ⬜ | Strike, escort, recon, etc. |
| MS-07 | Wingmen commands (AC5) | P1 | 🔶 | `WingmanController` stub |
| MS-08 | Ace duels + named pilots | P2 | 🔶 | `CampaignAceActor` stub |
| MS-09 | 8-mission indie campaign | P1 | 🔶 | 3 JSON missions exist |
| MS-10 | Large assault set-pieces | P2 | ⬜ | Content phase |
| MS-11 | Cutscenes (Sequencer) | P2 | ⬜ | In-engine first |
| MS-12 | Mod-friendly mission validator | P0 | ⬜ | JSON schema CI check |

---

## 5. Metagame / hangar

| ID | Item | Tier | Status | Action |
|----|------|------|--------|--------|
| MG-01 | Hangar aircraft list + stats | P1 | 🔶 | `UHangarSubsystem` skeleton |
| MG-02 | Loadout / SPW select | P1 | ⬜ | Pre-sortie screen |
| MG-03 | Save game + mission grid | P1 | 🔶 | `USkyWarriorSaveGame` header |
| MG-04 | Emblems / skins | P2 | ⬜ | Cosmetic pipeline |
| MG-05 | Difficulty rebalance tables | P1 | ⬜ | Data tables |
| MG-06 | New Game+ | P2 | ⬜ | Post-launch |

---

## 6. Audio and radio

| ID | Item | Tier | Status | Action |
|----|------|------|--------|--------|
| AU-01 | Lock tone (tracking / locked) | P0 | 🔶 | Iteration 1 |
| AU-02 | Missile inbound warning | P0 | 🔶 | Web beep + HUD flash |
| AU-03 | Dynamic combat music layers | P1 | ⬜ | MetaSounds states |
| AU-04 | Radio priority ducking | P1 | 🔶 | `RadioSubsystem` stub |
| AU-05 | Per-aircraft engine profiles | P1 | ⬜ | MetaSounds |
| AU-06 | Gun / explosion SFX | P0 | ⬜ | Web stub tones |

---

## 7. World and VFX

| ID | Item | Tier | Status | Action |
|----|------|------|--------|--------|
| WV-01 | Large outdoor theater | P1 | 🔶 | 120 km ocean + sky dome |
| WV-02 | Port Kestrel landmark blocks | P0 | ✅ Done | Harbor blocks + runway |
| WV-03 | Day/dusk/night + weather | P1 | 🔶 | Gradient sky + cloud puffs |
| WV-04 | Cloud layers fly-through | P2 | ⬜ | Niagara volumes |
| WV-05 | Explosions + contrails | P1 | 🔶 | Web burst particles |
| WV-06 | Afterburner / engine glow | P1 | ⬜ | Niagara |
| WV-07 | Destructible props (VFX swap) | P1 | ⬜ | Mesh swap on kill |

---

## 8. Multiplayer

| ID | Item | Tier | Status | Action |
|----|------|------|--------|--------|
| MP-01 | 8–16 player dogfight | P2 | ⬜ | Phase 5 |
| MP-02 | Co-op missions | P2 | ⬜ | Optional |
| MP-03 | Dedicated server / EOS | P2 | ⬜ | Server-auth weapons |
| MP-04 | Replay system | P2 | 🔶 | `ReplayRecorder` stub |

---

## 9. Accessibility

| ID | Item | Tier | Status | Action |
|----|------|------|--------|--------|
| AX-01 | Remappable controls | P1 | ⬜ | Enhanced Input |
| AX-02 | Subtitle size / contrast | P1 | ⬜ | UI settings |
| AX-03 | Colorblind lock states | P1 | ⬜ | Shape + color |
| AX-04 | Screen reader mission brief | P2 | ⬜ | Web aria labels |
| AX-05 | Difficulty assists (auto-trim) | P2 | ⬜ | Optional |

---

## 10. Modding and tools

| ID | Item | Tier | Status | Action |
|----|------|------|--------|--------|
| MD-01 | Mission JSON format docs | P0 | 🔶 | templates/README |
| MD-02 | JSON schema validation | P0 | ⬜ | CI script |
| MD-03 | Aircraft data asset exporter | P1 | ⬜ | Editor utility |
| MD-04 | Mission editor (web) | P2 | ⬜ | Differentiator |

---

## 11. Tech debt

| ID | Item | Tier | Status | Action |
|----|------|------|--------|--------|
| TD-01 | UE5 compile CI | P1 | ⬜ | GitHub Actions + UE runner |
| TD-02 | Unit tests: lock cone math | P0 | 🔶 | `LockMath.h` + script |
| TD-03 | Unit tests: damage / rank | P1 | ⬜ | Automation module |
| TD-04 | CombatHUD UMG binding | P0 | ⬜ | Widget blueprint in editor |
| TD-05 | Enhanced Input assets | P0 | ⬜ | Create in editor |
| TD-06 | FlightTuning map | P0 | ⬜ | Create in editor |
| TD-07 | Web prototype split modules | P2 | ⬜ | ES modules refactor |

---

## 12. Better than Ace Combat (differentiators)

| ID | Item | Tier | Status | Action |
|----|------|------|--------|--------|
| DF-01 | Mod-friendly mission JSON | P0 | ✅ Done | Already shipping |
| DF-02 | Ultrawide / HDR native | P2 | ⬜ | PC polish phase |
| DF-03 | 4-player co-op campaign | P2 | ⬜ | Scope decision |
| DF-04 | Photo mode | P2 | ⬜ | Free camera |
| DF-05 | Advanced accessibility pack | P1 | ⬜ | See §9 |
| DF-06 | Replay + share clips | P2 | 🔶 | Recorder stub |
| DF-07 | Web playable vertical slice | P0 | ✅ Done | Vercel demo — render fix 2026-05-26 |

---

## Iteration 1 — shipped this session

- [x] IMPROVEMENT_PLAN.md (this file)
- [x] Web: briefing overlay, compass, speed tape, lead pip, lock tones, SAM alert, tracers, radio subtitles, debrief rank
- [x] UE: `LockMath.h` lead point + cone helpers; TargetingComponent exposes lead; lock tone delegate usage doc
- [x] `scripts/test_lock_math.py` verification
- [x] LOOP_STATE.md + 2h dynamic heartbeat

## Urgent fix — web render (2026-05-26)

- [x] **Root cause:** No player aircraft mesh in scene; flat fog-matched blue background read as empty void; tracers never drawn to Three.js scene
- [x] Player VF-1 jet mesh (fuselage/wings/tail/canopy) + chase camera lag
- [x] Sky gradient dome, sun/hemisphere lights, ocean + coast, Port Kestrel blocks, clouds
- [x] Enemy fighters as jet meshes; SAM sites with dish + marker cone
- [x] `importmap` for reliable Three.js module load on Vercel
- [x] Mission JSON fetch from `missions/M01_first_light.json`
- [x] `prototype/web-flight/README.md` controls table
- [ ] Mouse look / gamepad — still keyboard-only
- [ ] GLTF aircraft art pass — procedural mesh placeholder

---

## Next iteration priorities (P0 → P1)

1. **CW-12** Gun TTK tuning pass with reference video comparison
2. **HU-08** Full radio pipeline in UE `RadioSubsystem`
3. **TD-04/05/06** Unblock UE PIE (Input assets + FlightTuning map + HUD widget)
4. **MS-12** Mission JSON schema validator in CI
5. **AU-06** Gun/explosion SFX in web + MetaSounds stub path
6. **WV-05** Niagara explosion template hook on `ADamageableUnit` death

---

## Acceptance checklist delta (P0 only)

| Feature | Before | After iter 1 |
|---------|--------|--------------|
| Gun lead indicator | ⬜ | 🔶 web + math |
| Lock tone | ⬜ | 🔶 |
| Tracers / hit feedback | ⬜ | 🔶 web |
| Compass + tapes | ⬜ | 🔶 web |
| Target distance | ⬜ | 🔶 web |
| Missile alert | ⬜ | 🔶 web |
| Briefing card | 🔶 | 🔶 web full |
| Debrief rank | ⬜ | 🔶 web |
| Lock math unit tests | ⬜ | 🔶 script |

**P0 checklist: 8/14 complete, 6/14 partial → ~57% → ~65% effective after iter 1**
