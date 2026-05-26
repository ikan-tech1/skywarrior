#pragma once

#include "CoreMinimal.h"
#include "AI/WingmanController.h"
#include "GameFramework/Actor.h"
#include "WingmanController.generated.h"

UENUM(BlueprintType)
enum class EWingmanCommand : uint8
{
	Follow,
	Attack,
	Retreat,
	Cover
};

/** Phase 2 wingman placeholder — attach to allied fighter pawns. */
UCLASS()
class SKYWARRIOR_API AWingmanController : public AActor
{
	GENERATED_BODY()

public:
	AWingmanController();

	UFUNCTION(BlueprintCallable, Category = "Wingman")
	void IssueCommand(EWingmanCommand Command);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Wingman")
	EWingmanCommand CurrentCommand = EWingmanCommand::Follow;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Wingman")
	FName Callsign = TEXT("Viper-3");
};
