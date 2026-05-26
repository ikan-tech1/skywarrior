# SkyWarrior Feature Matrix

Parity target mapped from arcade flight combat genre. **P0** = vertical slice / MVP, **P1** = mission OS + hangar alpha, **P2** = campaign polish + multiplayer.

Legend: ✅ planned in phase | 🔶 stub | ⬜ deferred

---

## Flight, cameras, input

| Feature | Reference genre | P0 | P1 | P2 | Notes |
|---------|-----------------|----|----|-----|-------|
| Arcade 6-DOF flight | All | ✅ | | | `UFlightDynamicsComponent` |
| Chase / cockpit cameras | All | ✅ | | | Spring arm + camera manager |
| Gamepad-first + keyboard | All | ✅ | | | Enhanced Input |
| HOTAS remapping | All | | ✅ | | Full rebind UI |
| Speed brake / flaps | Several | | ✅ | | Per-aircraft data |
| Post-stall maneuvers | AC7-style | | ✅ | | State machine + cooldown |
| Mid-mission RTB / resupply | Some | | | ⬜ | Optional mission type |

---

## Combat and weapons

| Feature | Reference genre | P0 | P1 | P2 | Notes |
|---------|-----------------|----|----|-----|-------|
| Gun + tracers + hit sparks | All | ✅ | | | Hitscan + web VFX; UE OnGunFired |
| IR missile + lock tone | All | ✅ | | | Web Audio + UTargetingComponent |
| Radar / special lock modes | Mix | | ✅ | | SEAD, multi-lock |
| Standard missiles + SPW slots | All | | ✅ | | `UWeaponDefinition` |
| Special weapons roster (6+) | Mix | | ✅ | | Data-driven |
| Multi-target / swarm missiles | AC6/7 | | | ✅ | Lock pipeline N targets |
| Ground/naval/air damage model | All | ✅ | | | `ADamageableUnit` hierarchy |
| Superweapons / bosses | Mix | | | ✅ | `ABossActor` phases |
| Flares / chaff | Several | | ✅ | | Simplified ECM |

---

## HUD and UX

| Feature | Reference genre | P0 | P1 | P2 | Notes |
|---------|-----------------|----|----|-----|-------|
| Radar + speed + altitude + compass | All | ✅ | | | Common UI widgets |
| Target box + distance + weapon info | All | ✅ | | | Lock diamond states |
| Objective panel + mission timer | All | ✅ | | | Mission subsystem hook |
| Radio subtitles + speaker tags | AC5/7 | | ✅ | | Subtitle pipeline |
| Damage / missile alerts | All | | ✅ | | Audio + HUD flash |
| Pause mission map | Several | | | ✅ | 2D overlay |
| Ultrawide HUD layout | — | 🔶 | | ✅ | Differentiator |

---

## Mission and campaign

| Feature | Reference genre | P0 | P1 | P2 | Notes |
|---------|-----------------|----|----|-----|-------|
| Briefing (map + text) | All | ✅ | ✅ | | Web card from JSON |
| Debriefing + rank S–D | All | | ✅ | | Rank calculator |
| Mission types (6 archetypes) | Mix | 🔶 | ✅ | | Templates in Phase 2 |
| Checkpoints + retry | AC7 | | ✅ | | Subsystem |
| Wingmen commands | AC5 | | ✅ | | BT + command enum |
| Large-scale assault set-pieces | AC6 | | | ✅ | Content phase |
| Ace duels + named pilots | Zero/5 | | | ✅ | IP bible aces |
| Cutscenes (Sequencer) | 7 | | | ✅ | In-engine first |
| 8-mission indie campaign | — | | ✅ | | Phase 4 target |
| Mod-friendly mission JSON | — | ✅ | | | Differentiator |

---

## Metagame

| Feature | Reference genre | P0 | P1 | P2 | Notes |
|---------|-----------------|----|----|-----|-------|
| Hangar: aircraft + stats | All | 🔶 | ✅ | | `UHangarSubsystem` |
| Loadout / special weapon select | All | | ✅ | | Pre-sortie |
| Emblems / skins | Several | | | ✅ | Cosmetic |
| Difficulty + scoring rebalance | All | | ✅ | | Data tables |
| Save game + mission select | Several | | ✅ | | `USkyWarriorSaveGame` |
| New Game+ | Several | | | ⬜ | Post-launch |

---

## World and presentation

| Feature | Reference genre | P0 | P1 | P2 | Notes |
|---------|-----------------|----|----|-----|-------|
| Large outdoor theater | All | 🔶 | ✅ | | 50–200 km feel |
| Day/dusk/night + weather | Mix | | ✅ | | Sky + fog volumes |
| Cloud layers fly-through | 7 | | | ✅ | VFX |
| City/ocean/mountain biomes | Mix | 🔶 | ✅ | | Vertical slice biome |
| Explosions, contrails, afterburner | All | 🔶 | ✅ | | Niagara |
| Destructible props (VFX swap) | Mix | | ✅ | | Not full Chaos city |

---

## Audio

| Feature | Reference genre | P0 | P1 | P2 | Notes |
|---------|-----------------|----|----|-----|-------|
| Dynamic combat music layers | All | | ✅ | | MetaSounds states |
| Radio drama mix (ducking) | All | | ✅ | | Priority bus |
| Distinct engine profiles | All | | ✅ | | Per aircraft |
| Lock tone / missile warning | All | ✅ | | | Phase 1 stub |

---

## Multiplayer

| Feature | Reference genre | P0 | P1 | P2 | Notes |
|---------|-----------------|----|----|-----|-------|
| 8–16 player dogfight | 7 | | | ✅ | Phase 5 |
| Co-op missions | AH/7 | | | ⬜ | Optional |
| Dedicated server / EOS | PC | | | ✅ | Server-authoritative weapons |
| Replay system | — | | | ✅ | Differentiator |

---

## Engineering / tools

| Feature | P0 | P1 | P2 | Notes |
|---------|----|----|-----|-------|
| Unit tests (damage/lock math) | 🔶 | ✅ | | Automation module |
| Flight playtest drills | ✅ | | | `FLIGHT_ACCEPTANCE.md` |
| CI compile (UE5) | | ✅ | | GitHub Actions when UE available |

---

## Summary counts

| Priority | Feature rows |
|----------|--------------|
| P0 | 14 |
| P1 | 28 |
| P2 | 18 |
