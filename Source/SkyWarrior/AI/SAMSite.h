#pragma once

#include "CoreMinimal.h"
#include "AI/SAMSite.h"
#include "AI/DamageableUnit.h"
#include "SAMSite.generated.h"

UCLASS()
class SKYWARRIOR_API ASAMSite : public ADamageableUnit
{
	GENERATED_BODY()

public:
	ASAMSite();

	virtual void ApplyDamage(float Amount, AActor* InstigatorActor) override;

	UFUNCTION(BlueprintCallable, Category = "AI")
	void TryLaunchAtPlayer();

protected:
	virtual void Tick(float DeltaTime) override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AI")
	float EngagementRangeMeters = 8000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AI")
	float FireIntervalSeconds = 5.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AI")
	float MissileDamage = 25.f;

private:
	float TimeSinceLastFire = 0.f;
};
