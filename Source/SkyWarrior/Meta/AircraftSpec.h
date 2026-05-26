#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "AircraftSpec.generated.h"

UCLASS(BlueprintType)
class SKYWARRIOR_API UAircraftSpec : public UPrimaryDataAsset
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Aircraft")
	FName AircraftId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Aircraft")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Aircraft")
	FText Description;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Stats")
	float SpeedRating = 70.f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Stats")
	float StabilityRating = 65.f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Stats")
	float DefenseRating = 50.f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Stats")
	float MobilityRating = 75.f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Stats")
	int32 SpecialWeaponSlots = 1;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Unlock")
	bool bUnlockedByDefault = false;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Unlock")
	FName UnlockMissionId;
};
