#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "SkyWarriorPlayerController.generated.h"

class UInputMappingContext;
class UUserWidget;

UCLASS()
class SKYWARRIOR_API ASkyWarriorPlayerController : public APlayerController
{
	GENERATED_BODY()

public:
	ASkyWarriorPlayerController();

protected:
	virtual void BeginPlay() override;
	virtual void SetupInputComponent() override;

	UPROPERTY(EditDefaultsOnly, Category = "Input")
	TObjectPtr<UInputMappingContext> DefaultMappingContext;

	UPROPERTY(EditDefaultsOnly, Category = "UI")
	TSubclassOf<UUserWidget> CombatHUDClass;

private:
	UPROPERTY()
	TObjectPtr<UUserWidget> CombatHUDWidget;
};
