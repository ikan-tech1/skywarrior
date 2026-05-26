#include "Meta/ReplayRecorder.h"

void UReplayRecorder::StartRecording(FName MissionId)
{
	bIsRecording = true;
	FrameLog.Empty();
	FrameLog.Add(FString::Printf(TEXT("Mission:%s"), *MissionId.ToString()));
}

void UReplayRecorder::StopRecording()
{
	bIsRecording = false;
}

void UReplayRecorder::RecordFrame(float Timestamp, const FVector& Location, const FRotator& Rotation)
{
	if (!bIsRecording)
	{
		return;
	}

	FrameLog.Add(FString::Printf(TEXT("T:%.3f Loc:%s Rot:%s"),
		Timestamp, *Location.ToString(), *Rotation.ToString()));
}
