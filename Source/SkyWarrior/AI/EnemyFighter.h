#pragma once

#include "CoreMinimal.h"
#include "AI/DamageableUnit.h"
#include "EnemyFighter.generated.h"

UCLASS()
class SKYWARRIOR_API AEnemyFighter : public ADamageableUnit
{
	GENERATED_BODY()

public:
	AEnemyFighter();

	virtual void ApplyDamage(float Amount, AActor* InstigatorActor) override;

protected:
	virtual void Tick(float DeltaTime) override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AI")
	float PursuitSpeed = 400.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AI")
	float TurnRate = 45.f;

private:
	void PursuePlayer(float DeltaTime);
};
