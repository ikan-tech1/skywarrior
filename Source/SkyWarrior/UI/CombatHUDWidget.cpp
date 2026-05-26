#include "UI/CombatHUDWidget.h"

void UCombatHUDWidget::UpdateFlightData(float SpeedKnots, float AltitudeFeet)
{
	DisplaySpeedKnots = SpeedKnots;
	DisplayAltitudeFeet = AltitudeFeet;
	OnHUDRefresh();
}

void UCombatHUDWidget::UpdateLockState(ELockState State, float LockProgress)
{
	DisplayLockState = State;
	DisplayLockProgress = LockProgress;
	OnHUDRefresh();
}

void UCombatHUDWidget::UpdateObjectives(const FText& ObjectiveText, float TimeRemaining)
{
	OnHUDRefresh();
}

void UCombatHUDWidget::UpdateWeaponStatus(const FText& WeaponName, int32 Ammo, int32 Missiles)
{
	OnHUDRefresh();
}

void UCombatHUDWidget::UpdateTargetData(float DistanceMeters, const FVector& GunLeadPoint)
{
	DisplayTargetDistanceMeters = DistanceMeters;
	DisplayGunLeadPoint = GunLeadPoint;
	OnHUDRefresh();
}

void UCombatHUDWidget::UpdateHeading(float HeadingDegrees)
{
	DisplayHeadingDegrees = HeadingDegrees;
	OnHUDRefresh();
}

void UCombatHUDWidget::SetMissileAlert(bool bActive)
{
	bDisplayMissileAlert = bActive;
	OnHUDRefresh();
}
