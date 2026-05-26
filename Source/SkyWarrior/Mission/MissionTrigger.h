#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Mission/MissionData.h"
#include "MissionTrigger.generated.h"

UCLASS()
class SKYWARRIOR_API AMissionTrigger : public AActor
{
	GENERATED_BODY()

public:
	AMissionTrigger();

	UFUNCTION(BlueprintCallable, Category = "Mission")
	void ActivateTrigger();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mission")
	EMissionObjectiveType ObjectiveType = EMissionObjectiveType::DestroyGround;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mission")
	bool bIsCheckpoint = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mission")
	FName CheckpointId;
};
