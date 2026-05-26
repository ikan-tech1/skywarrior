#include "Mission/MissionTrigger.h"
#include "Mission/MissionSubsystem.h"

AMissionTrigger::AMissionTrigger()
{
	PrimaryActorTick.bCanEverTick = false;
}

void AMissionTrigger::ActivateTrigger()
{
	if (UWorld* World = GetWorld())
	{
		if (UMissionSubsystem* Mission = World->GetSubsystem<UMissionSubsystem>())
		{
			Mission->RegisterKill(ObjectiveType);
		}
	}
}
