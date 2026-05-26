# Placeholder for Behavior Tree assets (create in editor Phase 2)
#
# BT_EnemyFighter:
#   - Selector
#     - Sequence (Attack): HasTarget -> InGunRange -> Strafe
#     - Sequence (Pursue): HasTarget -> Pursue
#     - Idle Patrol
#
# BT_Wingman:
#   - Switch on WingmanCommand enum (Follow, Attack, Retreat, Cover)
#
# Blackboard keys:
#   TargetActor, CommandEnum, BreakOffRange, MissileReady
