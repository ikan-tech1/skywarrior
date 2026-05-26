#include "SkyWarriorPlayerController.h"
#include "EnhancedInputSubsystems.h"
#include "UI/CombatHUDWidget.h"

ASkyWarriorPlayerController::ASkyWarriorPlayerController()
{
	bShowMouseCursor = false;
}

void ASkyWarriorPlayerController::BeginPlay()
{
	Super::BeginPlay();

	if (UEnhancedInputLocalPlayerSubsystem* Subsystem =
		ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(GetLocalPlayer()))
	{
		if (DefaultMappingContext)
		{
			Subsystem->AddMappingContext(DefaultMappingContext, 0);
		}
	}

	if (CombatHUDClass)
	{
		CombatHUDWidget = CreateWidget<UUserWidget>(this, CombatHUDClass);
		if (CombatHUDWidget)
		{
			CombatHUDWidget->AddToViewport();
		}
	}
}

void ASkyWarriorPlayerController::SetupInputComponent()
{
	Super::SetupInputComponent();
}
