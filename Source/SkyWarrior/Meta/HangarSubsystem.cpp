#include "Meta/HangarSubsystem.h"
#include "Meta/AircraftSpec.h"
#include "Kismet/GameplayStatics.h"

const FString UHangarSubsystem::SaveSlotPrefix = TEXT("SkyWarrior_");

bool UHangarSubsystem::LoadSave(const FString& SlotName)
{
	if (UGameplayStatics::DoesSaveGameExist(SaveSlotPrefix + SlotName, 0))
	{
		ActiveSave = Cast<USkyWarriorSaveGame>(
			UGameplayStatics::LoadGameFromSlot(SaveSlotPrefix + SlotName, 0));
	}

	if (!ActiveSave)
	{
		ActiveSave = Cast<USkyWarriorSaveGame>(
			UGameplayStatics::CreateSaveGameObject(USkyWarriorSaveGame::StaticClass()));
		ActiveSave->UnlockedAircraft.Add(TEXT("VF-1"));
	}

	return ActiveSave != nullptr;
}

bool UHangarSubsystem::SaveProgress(const FString& SlotName)
{
	if (!ActiveSave)
	{
		return false;
	}
	return UGameplayStatics::SaveGameToSlot(ActiveSave, SaveSlotPrefix + SlotName, 0);
}

void UHangarSubsystem::UnlockAircraft(FName AircraftId)
{
	if (ActiveSave && !ActiveSave->UnlockedAircraft.Contains(AircraftId))
	{
		ActiveSave->UnlockedAircraft.Add(AircraftId);
	}
}

bool UHangarSubsystem::IsAircraftUnlocked(FName AircraftId) const
{
	return ActiveSave && ActiveSave->UnlockedAircraft.Contains(AircraftId);
}

void UHangarSubsystem::SetLoadout(const FPlayerLoadout& Loadout)
{
	if (ActiveSave)
	{
		ActiveSave->CurrentLoadout = Loadout;
	}
}

FPlayerLoadout UHangarSubsystem::GetLoadout() const
{
	return ActiveSave ? ActiveSave->CurrentLoadout : FPlayerLoadout();
}

void UHangarSubsystem::CompleteMission(FName MissionId, int32 RankValue)
{
	if (!ActiveSave)
	{
		return;
	}

	if (!ActiveSave->CompletedMissions.Contains(MissionId))
	{
		ActiveSave->CompletedMissions.Add(MissionId);
	}

	int32& Best = ActiveSave->MissionBestRank.FindOrAdd(MissionId);
	Best = FMath::Min(Best == 0 ? RankValue : Best, RankValue);
}
