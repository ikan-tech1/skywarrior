#include "AI/DamageableUnit.h"

ADamageableUnit::ADamageableUnit()
{
	PrimaryActorTick.bCanEverTick = false;
	CurrentHealth = MaxHealth;
}

void ADamageableUnit::ApplyDamage(float Amount, AActor* InstigatorActor)
{
	if (!IsAlive())
	{
		return;
	}
	CurrentHealth = FMath::Max(0.f, CurrentHealth - Amount);
	if (!IsAlive())
	{
		OnDestroyed(InstigatorActor);
		Destroy();
	}
}

bool ADamageableUnit::IsHostileTo_Implementation(AActor* Other) const
{
	if (!Other)
	{
		return false;
	}
	// Player pawn tagged as friendly
	if (Other->ActorHasTag(TEXT("Player")))
	{
		return bIsEnemy;
	}
	return false;
}
