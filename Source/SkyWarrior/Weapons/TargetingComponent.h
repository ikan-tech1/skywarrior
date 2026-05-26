#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "TargetingComponent.generated.h"

UENUM(BlueprintType)
enum class ELockState : uint8
{
	None,
	Searching,
	Tracking,
	Locked,
	BreakLock
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnLockStateChanged, ELockState, NewState);

UCLASS(ClassGroup = (Weapons), meta = (BlueprintSpawnableComponent))
class SKYWARRIOR_API UTargetingComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UTargetingComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType,
		FActorComponentTickFunction* ThisTickFunction) override;

	UFUNCTION(BlueprintPure, Category = "Targeting")
	ELockState GetLockState() const { return LockState; }

	UFUNCTION(BlueprintPure, Category = "Targeting")
	bool IsLocked() const { return LockState == ELockState::Locked; }

	UFUNCTION(BlueprintPure, Category = "Targeting")
	AActor* GetCurrentTarget() const { return CurrentTarget.Get(); }

	UFUNCTION(BlueprintPure, Category = "Targeting")
	float GetLockProgress() const { return LockProgress; }

	/** Lead aim point for gun reticle (constant-velocity approximation). */
	UFUNCTION(BlueprintPure, Category = "Targeting")
	FVector GetLeadAimPoint(float ProjectileSpeedMetersPerSec = 900.f) const;

	UFUNCTION(BlueprintPure, Category = "Targeting")
	float GetTargetDistanceMeters() const;

	UPROPERTY(BlueprintAssignable, Category = "Targeting")
	FOnLockStateChanged OnLockStateChanged;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Targeting")
	float LockTimeSeconds = 1.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Targeting")
	float MaxLockRangeMeters = 5000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Targeting")
	float LockConeDegrees = 30.f;

protected:
	virtual void BeginPlay() override;

private:
	ELockState LockState = ELockState::None;
	float LockProgress = 0.f;
	TWeakObjectPtr<AActor> CurrentTarget;

	void UpdateLock(float DeltaTime);
	void SetLockState(ELockState NewState);
	AActor* FindBestTarget() const;
	bool IsTargetInCone(AActor* Target) const;
};
