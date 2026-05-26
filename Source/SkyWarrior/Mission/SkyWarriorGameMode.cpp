#include "Mission/SkyWarriorGameMode.h"
#include "Mission/MissionSubsystem.h"
#include "Flight/PlayerAircraft.h"
#include "SkyWarriorPlayerController.h"
#include "Kismet/GameplayStatics.h"

ASkyWarriorGameMode::ASkyWarriorGameMode()
{
	DefaultPawnClass = APlayerAircraft::StaticClass();
	PlayerControllerClass = ASkyWarriorPlayerController::StaticClass();
}

void ASkyWarriorGameMode::BeginPlay()
{
	Super::BeginPlay();

	if (UWorld* World = GetWorld())
	{
		if (UMissionSubsystem* Mission = World->GetSubsystem<UMissionSubsystem>())
		{
			const FString Path = FPaths::ProjectDir() / DefaultMissionJsonPath;
			if (Mission->LoadMissionFromJson(Path))
			{
				Mission->StartMission();
			}
		}
	}
}
