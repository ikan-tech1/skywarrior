# Wingman AI — Behavior Tree placeholder

Phase 2: implement in UE5 Editor.

## Nodes (planned)

- `BTTask_FollowLeader` — offset formation slot
- `BTTask_AttackTarget` — gun solution + missile window
- `BTTask_BreakOff` — disengage when fuel/health low
- `BTService_UpdateWingmanCommand` — read `EWingmanCommand` from squad leader

## Command enum (C++ stub location)

Add to `Source/SkyWarrior/AI/WingmanTypes.h` when implementing:

```cpp
UENUM(BlueprintType)
enum class EWingmanCommand : uint8
{
  Cover,
  Attack,
  Retreat,
  Spread
};
```

## Radio hooks

`URadioSubsystem::QueueRadioLine` for wingman ack on command change.
