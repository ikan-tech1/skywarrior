#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "SkyWarriorGameMode.generated.h"

UCLASS()
class SKYWARRIOR_API ASkyWarriorGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	ASkyWarriorGameMode();

protected:
	virtual void BeginPlay() override;

	UPROPERTY(EditDefaultsOnly, Category = "Mission")
	FString DefaultMissionJsonPath = TEXT("Content/Missions/M01_first_light.json");
};
