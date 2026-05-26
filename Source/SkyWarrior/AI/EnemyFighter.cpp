#include "AI/EnemyFighter.h"
#include "Kismet/GameplayStatics.h"
#include "Flight/PlayerAircraft.h"
#include "Mission/MissionSubsystem.h"
#include "Components/SceneComponent.h"

AEnemyFighter::AEnemyFighter()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
	MaxHealth = 60.f;
	CurrentHealth = MaxHealth;
}

void AEnemyFighter::ApplyDamage(float Amount, AActor* InstigatorActor)
{
	const bool bWasAlive = IsAlive();
	Super::ApplyDamage(Amount, InstigatorActor);
	if (bWasAlive && !IsAlive())
	{
		if (UWorld* World = GetWorld())
		{
			if (UMissionSubsystem* Mission = World->GetSubsystem<UMissionSubsystem>())
			{
				Mission->RegisterKill(EMissionObjectiveType::DestroyAir);
			}
		}
	}
}

void AEnemyFighter::PursuePlayer(float DeltaTime)
{
	APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(GetWorld(), 0);
	if (!PlayerPawn)
	{
		return;
	}

	const FVector ToPlayer = (PlayerPawn->GetActorLocation() - GetActorLocation()).GetSafeNormal();
	FRotator Desired = ToPlayer.Rotation();
	FRotator NewRot = FMath::RInterpTo(GetActorRotation(), Desired, DeltaTime, TurnRate / 45.f);
	SetActorRotation(NewRot);
	AddActorWorldOffset(GetActorForwardVector() * PursuitSpeed * 0.514444f * DeltaTime * 100.f, true);
}

void AEnemyFighter::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
	if (IsAlive())
	{
		PursuePlayer(DeltaTime);
	}
}
