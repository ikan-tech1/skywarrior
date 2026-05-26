#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "DamageableUnit.generated.h"

UCLASS(Abstract)
class SKYWARRIOR_API ADamageableUnit : public AActor
{
	GENERATED_BODY()

public:
	ADamageableUnit();

	UFUNCTION(BlueprintCallable, Category = "Combat")
	virtual void ApplyDamage(float Amount, AActor* InstigatorActor);

	UFUNCTION(BlueprintPure, Category = "Combat")
	float GetHealth() const { return CurrentHealth; }

	UFUNCTION(BlueprintPure, Category = "Combat")
	bool IsAlive() const { return CurrentHealth > 0.f; }

	UFUNCTION(BlueprintNativeEvent, Category = "Combat")
	bool IsHostileTo(AActor* Other) const;

protected:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
	float MaxHealth = 100.f;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Combat")
	float CurrentHealth = 100.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
	bool bIsEnemy = true;

	UFUNCTION(BlueprintImplementableEvent, Category = "Combat")
	void OnDestroyed(AActor* InstigatorActor);
};
