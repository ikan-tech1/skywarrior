# SkyWarrior Flight Acceptance Drills

Internal playtest criteria for validating arcade flight feel before content scaling. Compare side-by-side with reference genre clips (not for public distribution).

**Target platform:** PC, 1080p, 60 FPS  
**Tuning map:** `Content/Maps/FlightTuning`  
**Prototype fallback:** `prototype/web/` (when UE5 unavailable)

---

## Pass/fail global rules

- Input-to-response latency **≤ 50 ms** (gamepad or keyboard).
- No unrecoverable spin without counter-input for **≥ 3 seconds** at slice speeds.
- Stall assist engages below **120 km/h** equivalent; recovery within **2 seconds** with nose-down + throttle.
- Chase camera never occludes target box for **> 0.5 s** during level turn at slice defaults.

---

## Drill 1 — Sustained level turn

**Goal:** Hold 360° level turn without altitude loss > 200 m or speed bleed below 70% entry speed.

| Parameter | Pass | Fail |
|-----------|------|------|
| Entry speed | 450 km/h | — |
| Bank angle | 45–60° sustained | > 60° uncommanded snap |
| Altitude loss | ≤ 200 m | > 500 m |
| Control feel | Smooth roll-in, no oscillation | Porpoise or wing-waggle |

**Tuning levers:** `RollRate`, `PitchCoupling`, `DragCoefficient`

---

## Drill 2 — Scissors (slow-speed reversal)

**Goal:** Alternate left/right hard turns at 300 km/h; complete two reversals in < 8 s.

| Parameter | Pass | Fail |
|-----------|------|------|
| Min speed | ≥ 180 km/h | Stall spin |
| Reversal time | ≤ 4 s per direction change | Sluggish > 6 s |
| Recovery | Level flight within 1 s after stop input | Persistent roll |

**Tuning levers:** `YawRate`, `StallAssistStrength`, `AngularDamping`

---

## Drill 3 — Gun tracking (virtual target)

**Goal:** Track a constant-velocity target crossing at 800 m for 5 s; reticle within 2° lead cone ≥ 70% of time.

| Parameter | Pass | Fail |
|-----------|------|------|
| Range | 600–1000 m | — |
| Tracking accuracy | ≥ 70% in cone | < 50% |
| Pitch authority at speed | No mush above 400 km/h | Cannot pull lead |

**Tuning levers:** `PitchRate`, `ThrustMax`, gun lead assist (if enabled)

---

## Drill 4 — Missile jink

**Goal:** Break IR lock twice using flares + turn combo (or turn-only in Phase 1 without flares).

| Parameter | Pass | Fail |
|-----------|------|------|
| Lock break time after jink | ≤ 2 s | Never breaks |
| Re-lock time (enemy) | ≥ 4 s | Instant re-lock |
| Player energy after jink | ≥ 250 km/h | Near stall |

**Tuning levers:** `LockBreakAngle`, `LockSensitivity`, flare stub in `UTargetingComponent`

---

## Drill 5 — Post-stall maneuver (P1 optional)

**Goal:** Execute one deliberate high-alpha pitch-up; recover to controlled flight within 3 s.

| Parameter | Pass | Fail |
|-----------|------|------|
| Enabled | `bPostStallEnabled = true` | — |
| Cooldown respected | ≥ 8 s between uses | Spam allowed |
| Recovery | No inverted flat spin > 2 s | Unrecoverable |

**Tuning levers:** `PostStallPitchBoost`, `PostStallCooldown`, `StallAssistStrength`

---

## Recording template

For each drill session log:

```
Date:
Build:
Input device:
Aircraft spec:
Drill 1–5: PASS / FAIL
Notes:
Video file:
```

Store under `docs/playtests/` (create per session).

---

## Automation scope

- **Automated:** Unit tests on lock math, damage falloff, rank scoring.
- **Manual only:** All five drills — flight feel cannot be CI-gated.

---

## Phase 0 exit criterion

Two internal playtesters report **"this feels like arcade military flight"** after 30 minutes in tuning map or web prototype, without final HUD art.
