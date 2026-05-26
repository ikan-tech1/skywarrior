#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "ReplayRecorder.generated.h"

/** Stub for replay differentiator — records input snapshots for ghost playback. */
UCLASS()
class SKYWARRIOR_API UReplayRecorder : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Replay")
	void StartRecording(FName MissionId);

	UFUNCTION(BlueprintCallable, Category = "Replay")
	void StopRecording();

	UFUNCTION(BlueprintCallable, Category = "Replay")
	void RecordFrame(float Timestamp, const FVector& Location, const FRotator& Rotation);

	UPROPERTY(BlueprintReadOnly, Category = "Replay")
	bool bIsRecording = false;

private:
	TArray<FString> FrameLog;
};
