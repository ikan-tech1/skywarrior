#include "Flight/PlayerAircraft.h"
#include "Flight/FlightDynamicsComponent.h"
#include "Weapons/WeaponManager.h"
#include "Weapons/TargetingComponent.h"
#include "Camera/CameraComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "Components/InputComponent.h"
#include "Components/SceneComponent.h"

APlayerAircraft::APlayerAircraft()
{
	PrimaryActorTick.bCanEverTick = true;

	AircraftRoot = CreateDefaultSubobject<USceneComponent>(TEXT("AircraftRoot"));
	SetRootComponent(AircraftRoot);

	FlightDynamics = CreateDefaultSubobject<UFlightDynamicsComponent>(TEXT("FlightDynamics"));
	WeaponManager = CreateDefaultSubobject<UWeaponManager>(TEXT("WeaponManager"));
	Targeting = CreateDefaultSubobject<UTargetingComponent>(TEXT("Targeting"));

	ChaseSpringArm = CreateDefaultSubobject<USpringArmComponent>(TEXT("ChaseSpringArm"));
	ChaseSpringArm->SetupAttachment(RootComponent);
	ChaseSpringArm->TargetArmLength = 1200.f;
	ChaseSpringArm->bUsePawnControlRotation = false;
	ChaseSpringArm->bEnableCameraLag = true;
	ChaseSpringArm->CameraLagSpeed = 8.f;
	ChaseSpringArm->SetRelativeRotation(FRotator(-12.f, 0.f, 0.f));

	ChaseCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("ChaseCamera"));
	ChaseCamera->SetupAttachment(ChaseSpringArm, USpringArmComponent::SocketName);

	AutoPossessPlayer = EAutoReceiveInput::Player0;
}

void APlayerAircraft::BeginPlay()
{
	Super::BeginPlay();

	if (APlayerController* PC = Cast<APlayerController>(GetController()))
	{
		if (UEnhancedInputLocalPlayerSubsystem* Subsystem =
			ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(PC->GetLocalPlayer()))
		{
			if (DefaultMappingContext)
			{
				Subsystem->AddMappingContext(DefaultMappingContext, 0);
			}
		}
	}
}

void APlayerAircraft::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	if (ChaseSpringArm)
	{
		ChaseSpringArm->SetWorldRotation(GetActorRotation());
	}
}

void APlayerAircraft::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);

	if (UEnhancedInputComponent* EnhancedInput = Cast<UEnhancedInputComponent>(PlayerInputComponent))
	{
		if (ThrottleAction)
		{
			EnhancedInput->BindAction(ThrottleAction, ETriggerEvent::Triggered, this, &APlayerAircraft::HandleThrottle);
		}
		if (PitchAction)
		{
			EnhancedInput->BindAction(PitchAction, ETriggerEvent::Triggered, this, &APlayerAircraft::HandlePitch);
		}
		if (RollAction)
		{
			EnhancedInput->BindAction(RollAction, ETriggerEvent::Triggered, this, &APlayerAircraft::HandleRoll);
		}
		if (YawAction)
		{
			EnhancedInput->BindAction(YawAction, ETriggerEvent::Triggered, this, &APlayerAircraft::HandleYaw);
		}
		if (FireGunAction)
		{
			EnhancedInput->BindAction(FireGunAction, ETriggerEvent::Started, this, &APlayerAircraft::HandleFireGun);
		}
		if (FireMissileAction)
		{
			EnhancedInput->BindAction(FireMissileAction, ETriggerEvent::Started, this, &APlayerAircraft::HandleFireMissile);
		}
	}
}

void APlayerAircraft::HandleThrottle(const FInputActionValue& Value)
{
	if (FlightDynamics)
	{
		FlightDynamics->SetThrottleInput(Value.Get<float>());
	}
}

void APlayerAircraft::HandlePitch(const FInputActionValue& Value)
{
	if (FlightDynamics)
	{
		FlightDynamics->SetPitchInput(Value.Get<float>());
	}
}

void APlayerAircraft::HandleRoll(const FInputActionValue& Value)
{
	if (FlightDynamics)
	{
		FlightDynamics->SetRollInput(Value.Get<float>());
	}
}

void APlayerAircraft::HandleYaw(const FInputActionValue& Value)
{
	if (FlightDynamics)
	{
		FlightDynamics->SetYawInput(Value.Get<float>());
	}
}

void APlayerAircraft::HandleFireGun(const FInputActionValue& Value)
{
	if (WeaponManager && Targeting)
	{
		WeaponManager->FireGun(Targeting->GetCurrentTarget());
	}
}

void APlayerAircraft::HandleFireMissile(const FInputActionValue& Value)
{
	if (WeaponManager && Targeting && Targeting->IsLocked())
	{
		WeaponManager->FireMissile(Targeting->GetCurrentTarget());
	}
}
