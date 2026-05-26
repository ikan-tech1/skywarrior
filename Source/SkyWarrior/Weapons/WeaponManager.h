#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "WeaponManager.generated.h"

class UWeaponDefinition;

UCLASS(ClassGroup = (Weapons), meta = (BlueprintSpawnableComponent))
class SKYWARRIOR_API UWeaponManager : public UActorComponent
{
	GENERATED_BODY()

public:
	UWeaponManager();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	UFUNCTION(BlueprintCallable, Category = "Weapons")
	void FireGun(AActor* Target);

	UFUNCTION(BlueprintCallable, Category = "Weapons")
	void FireMissile(AActor* Target);

	UFUNCTION(BlueprintPure, Category = "Weapons")
	int32 GetGunAmmo() const { return GunAmmo; }

	UFUNCTION(BlueprintPure, Category = "Weapons")
	int32 GetMissileCount() const { return MissileCount; }

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapons")
	float GunDamage = 8.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapons")
	float GunRangeMeters = 2000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapons")
	float MissileDamage = 80.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapons")
	int32 GunAmmo = 800;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapons")
	int32 MissileCount = 4;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapons")
	TObjectPtr<UWeaponDefinition> GunDefinition;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapons")
	TObjectPtr<UWeaponDefinition> MissileDefinition;

private:
	bool PerformHitscan(AActor* Target, float Range, float Damage);
};
