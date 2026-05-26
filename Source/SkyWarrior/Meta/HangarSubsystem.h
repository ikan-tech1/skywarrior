#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Meta/SkyWarriorSaveGame.h"
#include "HangarSubsystem.generated.h"

UCLASS()
class SKYWARRIOR_API UHangarSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Hangar")
	bool LoadSave(const FString& SlotName = TEXT("Campaign"));

	UFUNCTION(BlueprintCallable, Category = "Hangar")
	bool SaveProgress(const FString& SlotName = TEXT("Campaign"));

	UFUNCTION(BlueprintCallable, Category = "Hangar")
	void UnlockAircraft(FName AircraftId);

	UFUNCTION(BlueprintPure, Category = "Hangar")
	bool IsAircraftUnlocked(FName AircraftId) const;

	UFUNCTION(BlueprintCallable, Category = "Hangar")
	void SetLoadout(const FPlayerLoadout& Loadout);

	UFUNCTION(BlueprintPure, Category = "Hangar")
	FPlayerLoadout GetLoadout() const;

	UFUNCTION(BlueprintCallable, Category = "Hangar")
	void CompleteMission(FName MissionId, int32 RankValue);

	UPROPERTY(BlueprintReadOnly, Category = "Hangar")
	TObjectPtr<USkyWarriorSaveGame> ActiveSave;

	UPROPERTY(EditDefaultsOnly, Category = "Hangar")
	TArray<TObjectPtr<UAircraftSpec>> AvailableAircraft;

private:
	static const FString SaveSlotPrefix;
};
