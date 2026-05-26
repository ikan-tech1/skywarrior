#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "FlightDynamicsComponent.generated.h"

/** Arcade flight dynamics tuning — not realistic aerodynamics simulation. */
UCLASS(ClassGroup = (Flight), meta = (BlueprintSpawnableComponent))
class SKYWARRIOR_API UFlightDynamicsComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UFlightDynamicsComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType,
		FActorComponentTickFunction* ThisTickFunction) override;

	UFUNCTION(BlueprintCallable, Category = "Flight")
	void SetThrottleInput(float Value);

	UFUNCTION(BlueprintCallable, Category = "Flight")
	void SetPitchInput(float Value);

	UFUNCTION(BlueprintCallable, Category = "Flight")
	void SetRollInput(float Value);

	UFUNCTION(BlueprintCallable, Category = "Flight")
	void SetYawInput(float Value);

	UFUNCTION(BlueprintPure, Category = "Flight")
	float GetAirspeedKnots() const { return CurrentAirspeedKnots; }

	UFUNCTION(BlueprintPure, Category = "Flight")
	float GetAltitudeFeet() const { return CurrentAltitudeFeet; }

	/** Thrust force applied along forward axis (Newtons, arbitrary scale). */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Flight|Tuning")
	float MaxThrust = 80000.f;

	/** Linear drag coefficient. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Flight|Tuning")
	float DragCoefficient = 0.015f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Flight|Tuning")
	float PitchRateDegPerSec = 55.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Flight|Tuning")
	float RollRateDegPerSec = 120.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Flight|Tuning")
	float YawRateDegPerSec = 25.f;

	/** Minimum controllable airspeed (knots). */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Flight|Tuning")
	float MinAirspeedKnots = 120.f;

	/** Stall assist — auto nose-down recovery below threshold. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Flight|Tuning")
	float StallAssistStrength = 0.35f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Flight|Tuning")
	float StallSpeedKnots = 140.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Flight|Tuning")
	float MaxAirspeedKnots = 850.f;

protected:
	virtual void BeginPlay() override;

private:
	float ThrottleInput = 0.f;
	float PitchInput = 0.f;
	float RollInput = 0.f;
	float YawInput = 0.f;

	float CurrentAirspeedKnots = 450.f;
	float CurrentAltitudeFeet = 10000.f;

	void IntegrateFlight(float DeltaTime, AActor* Owner);
};
