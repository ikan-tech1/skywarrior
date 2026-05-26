# SkyWarrior Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner phase |
|----|------|------------|--------|------------|-------------|
| R01 | Flight feel never matches genre bar | Medium | Critical | Phase 0 drills; dedicated tuning map; web prototype fallback | 0–1 |
| R02 | UE5 not installed on dev machine | High | High | `docs/UE5_SETUP.md`; C++ stubs compile when engine added; web prototype | 0 |
| R03 | Aircraft art cost / timeline | High | High | Fictional aircraft; marketplace placeholders; 1 hero mesh for slice | 1–4 |
| R04 | Large map performance (60 FPS) | Medium | High | World Partition; HLOD; fewer simultaneous actors in indie scope | 1–2 |
| R05 | Multiplayer netcode complexity | High | Medium | Defer to Phase 5; server-authoritative weapons design early | 5 |
| R06 | Scope creep (full AC parity) | High | Critical | Feature matrix P0/P1/P2; 8-mission indie cap | All |
| R07 | Legal — real aircraft / nation likeness | Low | High | Original IP bible; no trademarked designations in UI | 0 |
| R08 | AI dogfight quality | Medium | High | Behavior trees + tunable gun solution; ace scripts hand-authored | 1–2 |
| R09 | Mission scripting brittleness | Medium | Medium | Data-driven JSON + subsystem; checkpoint restarts | 2 |
| R10 | Audio/radio readability in combat | Medium | Medium | Priority ducking; subtitles Phase 2; lock tones Phase 1 | 1–2 |
| R11 | Save game corruption / progression loss | Low | High | Versioned save schema; backup slot | 3 |
| R12 | Solo dev bandwidth | High | High | Architecture-first; stubs; defer MP and full campaign | All |
| R13 | Enhanced Input / HOTAS edge cases | Medium | Low | Gamepad + KB first; HOTAS P1 | 1 |
| R14 | Special weapons balance explosion | Medium | Medium | 6 archetypes cap until Phase 4; data-driven tables | 3–4 |
| R15 | Sequencer cutscene production time | Medium | Medium | Briefing cards first; in-engine dialog only for slice | 4 |

---

## Review cadence

- **Phase gate:** Review all open risks before starting next phase.
- **Monthly:** Re-score likelihood/impact during active development.

---

## Current blockers (2026-05-26)

1. **R02 ACTIVE** — Unreal Engine 5 not detected on build machine. Development proceeds with C++ stubs + web flight prototype until UE5.5 installed per `docs/UE5_SETUP.md`.
