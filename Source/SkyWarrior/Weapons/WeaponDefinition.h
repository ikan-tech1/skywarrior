#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "WeaponDefinition.generated.h"

UENUM(BlueprintType)
enum class EWeaponType : uint8
{
	Gun,
	IRMissile,
	RadarMissile,
	Special
};

UCLASS(BlueprintType)
class SKYWARRIOR_API UWeaponDefinition : public UPrimaryDataAsset
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Weapon")
	FName WeaponId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Weapon")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Weapon")
	EWeaponType WeaponType = EWeaponType::Gun;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Weapon")
	float Damage = 10.f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Weapon")
	int32 MaxAmmo = 800;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Weapon|Missile")
	float LockTimeSeconds = 1.0f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Weapon|Missile")
	float MaxLockRangeMeters = 5000.f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Weapon|Missile")
	float MissileSpeed = 800.f;
};
