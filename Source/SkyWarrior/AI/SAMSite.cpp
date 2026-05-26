#include "AI/SAMSite.h"
#include "Kismet/GameplayStatics.h"
#include "Flight/PlayerAircraft.h"
#include "Flight/FlightDynamicsComponent.h"
#include "Mission/MissionSubsystem.h"
#include "Components/SceneComponent.h"

ASAMSite::ASAMSite()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
	MaxHealth = 40.f;
	CurrentHealth = MaxHealth;
}

void ASAMSite::ApplyDamage(float Amount, AActor* InstigatorActor)
{
	const bool bWasAlive = IsAlive();
	Super::ApplyDamage(Amount, InstigatorActor);
	if (bWasAlive && !IsAlive())
	{
		if (UWorld* World = GetWorld())
		{
			if (UMissionSubsystem* Mission = World->GetSubsystem<UMissionSubsystem>())
			{
				Mission->RegisterKill(EMissionObjectiveType::DestroyGround);
			}
		}
	}
}

void ASAMSite::TryLaunchAtPlayer()
{
	APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(GetWorld(), 0);
	if (!PlayerPawn)
	{
		return;
	}

	const float Dist = FVector::Dist(GetActorLocation(), PlayerPawn->GetActorLocation()) / 100.f;
	if (Dist > EngagementRangeMeters)
	{
		return;
	}

	if (UFlightDynamicsComponent* Flight = PlayerPawn->FindComponentByClass<UFlightDynamicsComponent>())
	{
		// Placeholder: apply chip damage to represent SAM near-miss / hit
		PlayerPawn->TakeDamage(MissileDamage, FDamageEvent(), nullptr, this);
	}
}

void ASAMSite::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	if (!IsAlive())
	{
		return;
	}

	TimeSinceLastFire += DeltaTime;
	if (TimeSinceLastFire >= FireIntervalSeconds)
	{
		TryLaunchAtPlayer();
		TimeSinceLastFire = 0.f;
	}
}
