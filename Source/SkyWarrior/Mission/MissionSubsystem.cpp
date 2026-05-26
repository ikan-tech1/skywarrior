#include "Mission/MissionSubsystem.h"
#include "Misc/FileHelper.h"
#include "JsonObjectConverter.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "TimerManager.h"

bool UMissionSubsystem::DoesSupportWorldType(EWorldType::Type WorldType) const
{
	return WorldType == EWorldType::Game || WorldType == EWorldType::PIE;
}

void UMissionSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
}

void UMissionSubsystem::Deinitialize()
{
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().ClearTimer(MissionTimerHandle);
	}
	Super::Deinitialize();
}

bool UMissionSubsystem::LoadMissionFromJson(const FString& FilePath)
{
	FString JsonString;
	if (!FFileHelper::LoadFileToString(JsonString, *FilePath))
	{
		return false;
	}
	return ParseMissionJson(JsonString, ActiveMission);
}

bool UMissionSubsystem::ParseMissionJson(const FString& JsonString, FMissionDefinition& OutMission)
{
	TSharedPtr<FJsonObject> Root;
	TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
	if (!FJsonSerializer::Deserialize(Reader, Root) || !Root.IsValid())
	{
		return false;
	}

	OutMission.MissionId = FName(*Root->GetStringField(TEXT("missionId")));
	OutMission.Title = FText::FromString(Root->GetStringField(TEXT("title")));
	OutMission.BriefingText = FText::FromString(Root->GetStringField(TEXT("briefing")));
	OutMission.TimeLimitSeconds = Root->GetNumberField(TEXT("timeLimitSeconds"));

	const TArray<TSharedPtr<FJsonValue>>* ObjectivesArray;
	if (Root->TryGetArrayField(TEXT("objectives"), ObjectivesArray))
	{
		OutMission.Objectives.Empty();
		for (const TSharedPtr<FJsonValue>& Val : *ObjectivesArray)
		{
			TSharedPtr<FJsonObject> Obj = Val->AsObject();
			if (!Obj.IsValid())
			{
				continue;
			}

			FMissionObjective Objective;
			Objective.ObjectiveId = FName(*Obj->GetStringField(TEXT("id")));
			const FString TypeStr = Obj->GetStringField(TEXT("type"));
			if (TypeStr == TEXT("destroyAir"))
			{
				Objective.Type = EMissionObjectiveType::DestroyAir;
			}
			else if (TypeStr == TEXT("destroyGround"))
			{
				Objective.Type = EMissionObjectiveType::DestroyGround;
			}
			Objective.Description = FText::FromString(Obj->GetStringField(TEXT("description")));
			Objective.RequiredCount = Obj->GetIntegerField(TEXT("count"));
			OutMission.Objectives.Add(Objective);
		}
	}

	return true;
}

void UMissionSubsystem::StartMission()
{
	bMissionActive = true;
	ElapsedTime = 0.f;

	for (FMissionObjective& Obj : ActiveMission.Objectives)
	{
		Obj.CurrentCount = 0;
		Obj.bCompleted = false;
	}

	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimer(
			MissionTimerHandle,
			this,
			&UMissionSubsystem::TickMissionTime,
			1.f,
			true);
	}
}

void UMissionSubsystem::TickMissionTime()
{
	if (!bMissionActive)
	{
		return;
	}

	ElapsedTime += 1.f;
	CheckFailCondition();
	CheckWinCondition();
}

float UMissionSubsystem::GetTimeRemaining() const
{
	return FMath::Max(0.f, ActiveMission.TimeLimitSeconds - ElapsedTime);
}

void UMissionSubsystem::RegisterKill(EMissionObjectiveType Type)
{
	if (!bMissionActive)
	{
		return;
	}

	for (FMissionObjective& Obj : ActiveMission.Objectives)
	{
		if (Obj.Type == Type && !Obj.bCompleted)
		{
			Obj.CurrentCount++;
			if (Obj.CurrentCount >= Obj.RequiredCount)
			{
				Obj.bCompleted = true;
			}
		}
	}

	CheckWinCondition();
}

void UMissionSubsystem::CheckWinCondition()
{
	if (!bMissionActive)
	{
		return;
	}

	for (const FMissionObjective& Obj : ActiveMission.Objectives)
	{
		if (!Obj.bCompleted)
		{
			return;
		}
	}

	bMissionActive = false;
	OnMissionWon.Broadcast();
}

void UMissionSubsystem::CheckFailCondition()
{
	if (!bMissionActive)
	{
		return;
	}

	if (ElapsedTime >= ActiveMission.TimeLimitSeconds)
	{
		bMissionActive = false;
		OnMissionFailed.Broadcast();
	}
}

EMissionRank UMissionSubsystem::CalculateRank() const
{
	const float TimeRatio = ElapsedTime / FMath::Max(ActiveMission.TimeLimitSeconds, 1.f);
	if (TimeRatio < 0.5f)
	{
		return EMissionRank::S;
	}
	if (TimeRatio < 0.65f)
	{
		return EMissionRank::A;
	}
	if (TimeRatio < 0.8f)
	{
		return EMissionRank::B;
	}
	if (TimeRatio < 0.95f)
	{
		return EMissionRank::C;
	}
	return EMissionRank::D;
}

void UMissionSubsystem::SetCheckpoint(FName CheckpointId)
{
	LastCheckpointId = CheckpointId;
}
