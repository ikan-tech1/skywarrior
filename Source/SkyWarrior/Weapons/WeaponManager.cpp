#include "Weapons/WeaponManager.h"
#include "AI/DamageableUnit.h"
#include "DrawDebugHelpers.h"

UWeaponManager::UWeaponManager()
{
	PrimaryComponentTick.bCanEverTick = false;
}

bool UWeaponManager::PerformHitscan(AActor* Target, float Range, float Damage)
{
	AActor* Owner = GetOwner();
	if (!Owner)
	{
		return false;
	}

	FVector Start = Owner->GetActorLocation();
	FVector End = Start + Owner->GetActorForwardVector() * Range * 100.f;

	if (Target)
	{
		End = Target->GetActorLocation();
	}

	FHitResult Hit;
	FCollisionQueryParams Params;
	Params.AddIgnoredActor(Owner);

	const bool bHit = GetWorld()->LineTraceSingleByChannel(Hit, Start, End, ECC_Visibility, Params);
#if WITH_EDITOR
	DrawDebugLine(GetWorld(), Start, bHit ? Hit.ImpactPoint : End, FColor::Red, false, 0.1f, 0, 2.f);
#endif

	if (bHit && Hit.GetActor())
	{
		if (ADamageableUnit* Unit = Cast<ADamageableUnit>(Hit.GetActor()))
		{
			Unit->ApplyDamage(Damage, Owner);
			return true;
		}
	}

	return false;
}

void UWeaponManager::FireGun(AActor* Target)
{
	if (GunAmmo <= 0)
	{
		return;
	}

	GunAmmo--;

	AActor* Owner = GetOwner();
	FVector Muzzle = Owner ? Owner->GetActorLocation() : FVector::ZeroVector;
	FVector Impact = Muzzle;

	if (Owner)
	{
		Impact = Muzzle + Owner->GetActorForwardVector() * GunRangeMeters * 100.f;
	}

	if (PerformHitscan(Target, GunRangeMeters, GunDamage))
	{
		if (Target)
		{
			Impact = Target->GetActorLocation();
		}
	}

	OnGunFired.Broadcast(Muzzle, Impact);
}

void UWeaponManager::FireMissile(AActor* Target)
{
	if (MissileCount <= 0 || !Target)
	{
		return;
	}

	MissileCount--;

	if (ADamageableUnit* Unit = Cast<ADamageableUnit>(Target))
	{
		Unit->ApplyDamage(MissileDamage, GetOwner());
	}
}
