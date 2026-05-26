#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "Mission/MissionData.h"
#include "MissionSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnMissionWon);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnMissionFailed);

UENUM(BlueprintType)
enum class EMissionRank : uint8
{
	S,
	A,
	B,
	C,
	D
};

UCLASS()
class SKYWARRIOR_API UMissionSubsystem : public UWorldSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Mission")
	bool LoadMissionFromJson(const FString& FilePath);

	UFUNCTION(BlueprintCallable, Category = "Mission")
	void StartMission();

	UFUNCTION(BlueprintCallable, Category = "Mission")
	void RegisterKill(EMissionObjectiveType Type);

	UFUNCTION(BlueprintCallable, Category = "Mission")
	void SetCheckpoint(FName CheckpointId);

	UFUNCTION(BlueprintPure, Category = "Mission")
	float GetElapsedTime() const { return ElapsedTime; }

	UFUNCTION(BlueprintPure, Category = "Mission")
	float GetTimeRemaining() const;

	UFUNCTION(BlueprintPure, Category = "Mission")
	bool IsMissionActive() const { return bMissionActive; }

	UFUNCTION(BlueprintPure, Category = "Mission")
	const FMissionDefinition& GetActiveMission() const { return ActiveMission; }

	UFUNCTION(BlueprintCallable, Category = "Mission")
	EMissionRank CalculateRank() const;

	UPROPERTY(BlueprintAssignable, Category = "Mission")
	FOnMissionWon OnMissionWon;

	UPROPERTY(BlueprintAssignable, Category = "Mission")
	FOnMissionFailed OnMissionFailed;

protected:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	virtual void Deinitialize() override;
	virtual bool DoesSupportWorldType(EWorldType::Type WorldType) const override;

private:
	FMissionDefinition ActiveMission;
	bool bMissionActive = false;
	float ElapsedTime = 0.f;
	FName LastCheckpointId;
	FTimerHandle MissionTimerHandle;

	UFUNCTION()
	void TickMissionTime();

	void CheckWinCondition();
	void CheckFailCondition();
	bool ParseMissionJson(const FString& JsonString, FMissionDefinition& OutMission);
};
