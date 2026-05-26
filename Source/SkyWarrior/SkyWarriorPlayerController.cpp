#include "SkyWarriorPlayerController.h"
#include "EnhancedInputSubsystems.h"
#include "UI/CombatHUDWidget.h"
#include "Flight/PlayerAircraft.h"
#include "Flight/FlightDynamicsComponent.h"
#include "Weapons/TargetingComponent.h"
#include "Weapons/WeaponManager.h"

ASkyWarriorPlayerController::ASkyWarriorPlayerController()
{
	bShowMouseCursor = false;
	PrimaryActorTick.bCanEverTick = true;
}

UCombatHUDWidget* ASkyWarriorPlayerController::GetCombatHUD() const
{
	return Cast<UCombatHUDWidget>(CombatHUDWidget);
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

void ASkyWarriorPlayerController::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
	RefreshCombatHUD();
}

void ASkyWarriorPlayerController::RefreshCombatHUD()
{
	UCombatHUDWidget* HUD = GetCombatHUD();
	APlayerAircraft* Aircraft = Cast<APlayerAircraft>(GetPawn());
	if (!HUD || !Aircraft)
	{
		return;
	}

	if (UFlightDynamicsComponent* Flight = Aircraft->GetFlightDynamics())
	{
		HUD->UpdateFlightData(Flight->GetAirspeedKnots(), Flight->GetAltitudeFeet());
	}

	if (UTargetingComponent* Targeting = Aircraft->GetTargeting())
	{
		HUD->UpdateLockState(Targeting->GetLockState(), Targeting->GetLockProgress());
		HUD->UpdateTargetData(
			Targeting->GetTargetDistanceMeters(),
			Targeting->GetLeadAimPoint());
	}

	if (UWeaponManager* Weapons = Aircraft->GetWeaponManager())
	{
		HUD->UpdateWeaponStatus(
			FText::FromString(TEXT("VULCAN-20")),
			Weapons->GetGunAmmo(),
			Weapons->GetMissileCount());
	}

	const float Heading = Aircraft->GetActorRotation().Yaw;
	const float Normalized = Heading < 0.f ? Heading + 360.f : Heading;
	HUD->UpdateHeading(Normalized);
}
