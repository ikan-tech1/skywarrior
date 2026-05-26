#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "CampaignAceActor.generated.h"

/** Phase 4 ace duel boss placeholder with phased behavior. */
UCLASS()
class SKYWARRIOR_API ACampaignAceActor : public AActor
{
	GENERATED_BODY()

public:
	ACampaignAceActor();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ace")
	FName AceId;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ace")
	FText AceCallsign;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ace")
	int32 CurrentPhase = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ace")
	int32 MaxPhases = 2;

	UFUNCTION(BlueprintCallable, Category = "Ace")
	void AdvancePhase();
};
