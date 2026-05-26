#pragma once

#include "CoreMinimal.h"
#include "GameFramework/SaveGame.h"
#include "Meta/AircraftSpec.h"
#include "SkyWarriorSaveGame.generated.h"

USTRUCT(BlueprintType)
struct FPlayerLoadout
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FName AircraftId = TEXT("VF-1");

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FName SpecialWeaponId = TEXT("SKR-IR");
};

UCLASS()
class SKYWARRIOR_API USkyWarriorSaveGame : public USaveGame
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	int32 SaveVersion = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	TArray<FName> UnlockedAircraft;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	TArray<FName> CompletedMissions;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	TMap<FName, int32> MissionBestRank;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FPlayerLoadout CurrentLoadout;
};
