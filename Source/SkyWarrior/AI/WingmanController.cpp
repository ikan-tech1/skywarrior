#include "AI/WingmanController.h"

AWingmanController::AWingmanController()
{
	PrimaryActorTick.bCanEverTick = false;
}

void AWingmanController::IssueCommand(EWingmanCommand Command)
{
	CurrentCommand = Command;
	// Phase 2: drive Behavior Tree blackboard key "WingmanCommand"
}
