# SkyWarrior — Game Design Document

**Version:** 0.1 (Preproduction)  
**Engine:** Unreal Engine 5.5+ (C++ core, Blueprint glue)  
**Platform target:** PC (Steam) first; console later  
**Campaign target (indie path):** 8 missions, ~6–8 hours golden path

---

## Elevator pitch

SkyWarrior is an original arcade military flight combat game in the tradition of large-theater hero aviation — effortless hero flight, gun-first dogfighting, cinematic radio drama, and mission clarity — without sim complexity. Players fly as **Viper Squadron** over the **Meridian Strait** during the **Ashford Conflict**, unlocking aircraft and loadouts between sorties.

---

## Design north star

SkyWarrior is **not** a hardcore simulator (DCS, IL-2). It is an **accessible arcade flight model** with **cinematic presentation**. "Realistic" means believable aircraft identity, speeds, loadouts, and damage — not full systems simulation.

---

## Non-negotiable feel pillars

1. **Effortless hero flight** — Responsive pitch/roll/yaw, generous energy, recoverable stalls; optional post-stall maneuvers as advanced skill ceiling.
2. **Gun-first identity** — Machine gun always relevant; lead indicator; satisfying hit feedback (tracers, sparks, audio punch).
3. **Missile fantasy** — Lock tone progression, multi-lock pipeline, special weapons that change mission tempo.
4. **Theater scale** — Large map, simultaneous ground/air/sea threats, radio-driven battlefield awareness (AWACS, wingmen, ace callouts).
5. **Mission clarity** — Objective list, checkpoint restarts, ranked performance (time + damage + targets).
6. **Hangar progression** — Aircraft stats matter; loadout choice before sortie; new planes unlock campaign tension.

If any phase ships without these pillars feeling right, stop adding content and fix flight/HUD/audio.

---

## Scope (indie phased path)

| Phase | Deliverable |
|-------|-------------|
| 0 | GDD, IP bible, flight acceptance drills, UE5 scaffold |
| 1 | Vertical slice: 1 theater, 1 jet, gun + IR missile, SAM/fighter AI, HUD, 10-min mission |
| 2 | Mission OS: briefing/debrief, ranks, checkpoints, 5 templates, basic wingmen |
| 3 | Hangar: aircraft data assets, loadouts, save game, mission select |
| 4 | Campaign: 8 missions, aces, radio pipeline, Sequencer cutscenes |
| 5 | Multiplayer (P2), polish, differentiators |

---

## "Better than" differentiators (chosen)

1. **Mod-friendly mission format** — JSON/DataTable missions editable without recompile; documented schema in `Content/Missions/`.
2. **Replay system** — Record aircraft state + inputs per sortie for debrief scrub (Phase 5).
3. **Ultrawide HUD** — Common UI layout scales to 21:9 and 32:9; radar band reflows (Phase 1 stub, Phase 5 polish).

Deferred differentiators: photo mode, VR chase cam, mission editor, 4-player co-op campaign.

---

## Core loop

```
Briefing → Sortie (objectives + combat) → Debrief (rank + unlocks) → Hangar (loadout) → Next mission
```

---

## Player fantasy

- Fly a responsive hero jet through a living battlefield.
- Win with guns and missiles, not spreadsheet management.
- Hear the war: AWACS vectors, wingman banter, ace taunts.
- Earn S-rank through speed, precision, and minimal damage.

---

## Aircraft roster (campaign target)

| Tier | Aircraft (original) | Role |
|------|---------------------|------|
| Starter | Kestrel F-1 | Balanced multirole |
| Mid | Talon ST-9 | Strike / SEAD |
| Late | Mirage V-4 | Air superiority |
| Special | Wraith X | Unlockable superfighter |

All names and silhouettes are fictional IP — no real-world trademarked designations in shipping UI.

---

## Mission types (8-mission campaign)

1. **Trial by Fire** — Air superiority intro (vertical slice)
2. **Iron Gate** — SEAD / SAM suppression
3. **Convoy Hammer** — Strike escort
4. **Ghost Frequency** — Recon + stealth approach
5. **Harbor Storm** — Naval strike
6. **Broken Arrow** — Ace duel
7. **Skyfall** — Superweapon intercept
8. **Last Meridian** — Final assault + boss

---

## Technical pillars

- C++ gameplay systems; Blueprint for tuning and level scripting.
- Data-driven weapons, aircraft, missions.
- World Partition theater map; mission sublevels for spawns.
- 60 FPS target at 1080p on documented min spec.

---

## Out of scope (v0.1)

- Full planet-scale sim
- Real aircraft licensing
- Console certification
- Dedicated server multiplayer (Phase 5 only)
