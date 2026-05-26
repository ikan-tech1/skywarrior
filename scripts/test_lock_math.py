#!/usr/bin/env python3
"""Verify lock cone and lead math mirrors SkyWarriorLockMath.h (P0 unit test stub)."""
import math
import sys

def cone_dot_threshold(deg):
    return math.cos(math.radians(max(1, min(179, deg))))

def is_in_cone(owner_fwd, to_target, cone_deg=30):
    dot = sum(a * b for a, b in zip(owner_fwd, to_target))
    mag = math.sqrt(sum(x * x for x in to_target))
    if mag < 1e-6:
        return False
    return dot / mag >= cone_dot_threshold(cone_deg)

def lead_point(shooter, shooter_vel, target, target_vel, proj_speed):
    to_t = [target[i] - shooter[i] for i in range(3)]
    rel_v = [target_vel[i] - shooter_vel[i] for i in range(3)]
    speed = max(proj_speed, 1.0)
    dist = math.sqrt(sum(x * x for x in to_t))
    t = dist / speed
    return tuple(target[i] + target_vel[i] * t for i in range(3))

def test_cone():
    assert is_in_cone((0, 0, -1), (0, 0, -1), 30)
    assert not is_in_cone((0, 0, -1), (1, 0, 0), 30)
    assert is_in_cone((0, 0, -1), (0.2, 0, -1), 30)

def test_lead():
    lp = lead_point((0, 0, 0), (200, 0, 0), (1000, 0, 0), (100, 0, 0), 800)
    assert lp[0] > 1000, f"lead should be ahead of target, got {lp}"

def main():
    test_cone()
    test_lead()
    print("OK: lock math tests passed")
    return 0

if __name__ == "__main__":
    sys.exit(main())
