#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Weapons/TargetingComponent.h"
#include "CombatHUDWidget.generated.h"

UCLASS(Abstract, Blueprintable)
class SKYWARRIOR_API UCombatHUDWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "HUD")
	void UpdateFlightData(float SpeedKnots, float AltitudeFeet);

	UFUNCTION(BlueprintCallable, Category = "HUD")
	void UpdateLockState(ELockState State, float LockProgress);

	UFUNCTION(BlueprintCallable, Category = "HUD")
	void UpdateObjectives(const FText& ObjectiveText, float TimeRemaining);

	UFUNCTION(BlueprintCallable, Category = "HUD")
	void UpdateWeaponStatus(const FText& WeaponName, int32 Ammo, int32 Missiles);

	UFUNCTION(BlueprintCallable, Category = "HUD")
	void UpdateTargetData(float DistanceMeters, const FVector& GunLeadPoint);

	UFUNCTION(BlueprintCallable, Category = "HUD")
	void UpdateHeading(float HeadingDegrees);

	UFUNCTION(BlueprintCallable, Category = "HUD")
	void SetMissileAlert(bool bActive);

	UFUNCTION(BlueprintImplementableEvent, Category = "HUD")
	void OnHUDRefresh();

protected:
	UPROPERTY(BlueprintReadOnly, Category = "HUD")
	float DisplaySpeedKnots = 0.f;

	UPROPERTY(BlueprintReadOnly, Category = "HUD")
	float DisplayAltitudeFeet = 0.f;

	UPROPERTY(BlueprintReadOnly, Category = "HUD")
	ELockState DisplayLockState = ELockState::None;

	UPROPERTY(BlueprintReadOnly, Category = "HUD")
	float DisplayLockProgress = 0.f;

	UPROPERTY(BlueprintReadOnly, Category = "HUD")
	float DisplayTargetDistanceMeters = -1.f;

	UPROPERTY(BlueprintReadOnly, Category = "HUD")
	FVector DisplayGunLeadPoint = FVector::ZeroVector;

	UPROPERTY(BlueprintReadOnly, Category = "HUD")
	float DisplayHeadingDegrees = 0.f;

	UPROPERTY(BlueprintReadOnly, Category = "HUD")
	bool bDisplayMissileAlert = false;
};
