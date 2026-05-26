#include "Flight/FlightDynamicsComponent.h"

UFlightDynamicsComponent::UFlightDynamicsComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

void UFlightDynamicsComponent::BeginPlay()
{
	Super::BeginPlay();
}

void UFlightDynamicsComponent::SetThrottleInput(float Value)
{
	ThrottleInput = FMath::Clamp(Value, 0.f, 1.f);
}

void UFlightDynamicsComponent::SetPitchInput(float Value)
{
	PitchInput = FMath::Clamp(Value, -1.f, 1.f);
}

void UFlightDynamicsComponent::SetRollInput(float Value)
{
	RollInput = FMath::Clamp(Value, -1.f, 1.f);
}

void UFlightDynamicsComponent::SetYawInput(float Value)
{
	YawInput = FMath::Clamp(Value, -1.f, 1.f);
}

void UFlightDynamicsComponent::IntegrateFlight(float DeltaTime, AActor* Owner)
{
	if (!Owner)
	{
		return;
	}

	const float AirspeedMS = CurrentAirspeedKnots * 0.514444f;
	const float Thrust = MaxThrust * ThrottleInput;
	const float Drag = DragCoefficient * AirspeedMS * AirspeedMS;
	const float NetAccel = (Thrust - Drag) / 15000.f;
	const float NewAirspeedMS = FMath::Clamp(AirspeedMS + NetAccel * DeltaTime, MinAirspeedKnots * 0.514444f, MaxAirspeedKnots * 0.514444f);
	CurrentAirspeedKnots = NewAirspeedMS / 0.514444f;

	FRotator Rotation = Owner->GetActorRotation();
	Rotation.Pitch += PitchInput * PitchRateDegPerSec * DeltaTime;
	Rotation.Roll += RollInput * RollRateDegPerSec * DeltaTime;
	Rotation.Yaw += YawInput * YawRateDegPerSec * DeltaTime;

	if (CurrentAirspeedKnots < StallSpeedKnots)
	{
		Rotation.Pitch -= StallAssistStrength * PitchRateDegPerSec * DeltaTime;
	}

	Owner->SetActorRotation(Rotation);

	const FVector Forward = Owner->GetActorForwardVector();
	Owner->AddActorWorldOffset(Forward * NewAirspeedMS * DeltaTime, true);

	CurrentAltitudeFeet = Owner->GetActorLocation().Z * 0.0328084f;
}

void UFlightDynamicsComponent::TickComponent(float DeltaTime, ELevelTick TickType,
	FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);
	IntegrateFlight(DeltaTime, GetOwner());
}
