#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Pawn.h"
#include "InputActionValue.h"
#include "PlayerAircraft.generated.h"

class UFlightDynamicsComponent;
class UWeaponManager;
class UTargetingComponent;
class USpringArmComponent;
class UCameraComponent;
class UInputMappingContext;
class UInputAction;
class USceneComponent;

UCLASS()
class SKYWARRIOR_API APlayerAircraft : public APawn
{
	GENERATED_BODY()

public:
	APlayerAircraft();

	UFUNCTION(BlueprintPure, Category = "Flight")
	UFlightDynamicsComponent* GetFlightDynamics() const { return FlightDynamics; }

	UFUNCTION(BlueprintPure, Category = "Weapons")
	UWeaponManager* GetWeaponManager() const { return WeaponManager; }

	UFUNCTION(BlueprintPure, Category = "Weapons")
	UTargetingComponent* GetTargeting() const { return Targeting; }

protected:
	virtual void BeginPlay() override;
	virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;
	virtual void Tick(float DeltaTime) override;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Flight")
	TObjectPtr<USceneComponent> AircraftRoot;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Flight")
	TObjectPtr<UFlightDynamicsComponent> FlightDynamics;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Weapons")
	TObjectPtr<UWeaponManager> WeaponManager;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Weapons")
	TObjectPtr<UTargetingComponent> Targeting;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
	TObjectPtr<USpringArmComponent> ChaseSpringArm;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
	TObjectPtr<UCameraComponent> ChaseCamera;

	UPROPERTY(EditDefaultsOnly, Category = "Input")
	TObjectPtr<UInputMappingContext> DefaultMappingContext;

	UPROPERTY(EditDefaultsOnly, Category = "Input")
	TObjectPtr<UInputAction> ThrottleAction;

	UPROPERTY(EditDefaultsOnly, Category = "Input")
	TObjectPtr<UInputAction> PitchAction;

	UPROPERTY(EditDefaultsOnly, Category = "Input")
	TObjectPtr<UInputAction> RollAction;

	UPROPERTY(EditDefaultsOnly, Category = "Input")
	TObjectPtr<UInputAction> YawAction;

	UPROPERTY(EditDefaultsOnly, Category = "Input")
	TObjectPtr<UInputAction> FireGunAction;

	UPROPERTY(EditDefaultsOnly, Category = "Input")
	TObjectPtr<UInputAction> FireMissileAction;

private:
	void HandleThrottle(const FInputActionValue& Value);
	void HandlePitch(const FInputActionValue& Value);
	void HandleRoll(const FInputActionValue& Value);
	void HandleYaw(const FInputActionValue& Value);
	void HandleFireGun(const FInputActionValue& Value);
	void HandleFireMissile(const FInputActionValue& Value);
};
