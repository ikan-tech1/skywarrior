#pragma once

#include "CoreMinimal.h"
#include "MissionData.generated.h"

UENUM(BlueprintType)
enum class EMissionObjectiveType : uint8
{
	DestroyAir,
	DestroyGround,
	DestroyNaval,
	Escort,
	ReachWaypoint,
	Stealth
};

USTRUCT(BlueprintType)
struct FMissionObjective
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FName ObjectiveId;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	EMissionObjectiveType Type = EMissionObjectiveType::DestroyAir;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FText Description;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	int32 RequiredCount = 1;

	UPROPERTY(BlueprintReadOnly)
	int32 CurrentCount = 0;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	bool bCompleted = false;
};

USTRUCT(BlueprintType)
struct FMissionDefinition
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FName MissionId;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FText Title;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FText BriefingText;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	float TimeLimitSeconds = 600.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	TArray<FMissionObjective> Objectives;
};
