#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "SkyWarriorPlayerController.generated.h"

class UInputMappingContext;
class UUserWidget;
class UCombatHUDWidget;

UCLASS()
class SKYWARRIOR_API ASkyWarriorPlayerController : public APlayerController
{
	GENERATED_BODY()

public:
	ASkyWarriorPlayerController();

	UFUNCTION(BlueprintPure, Category = "UI")
	UCombatHUDWidget* GetCombatHUD() const;

protected:
	virtual void BeginPlay() override;
	virtual void SetupInputComponent() override;
	virtual void Tick(float DeltaTime) override;

	UPROPERTY(EditDefaultsOnly, Category = "Input")
	TObjectPtr<UInputMappingContext> DefaultMappingContext;

	UPROPERTY(EditDefaultsOnly, Category = "UI")
	TSubclassOf<UUserWidget> CombatHUDClass;

private:
	UPROPERTY()
	TObjectPtr<UUserWidget> CombatHUDWidget;

	void RefreshCombatHUD();
};
