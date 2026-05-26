#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "RadioSubsystem.generated.h"

USTRUCT(BlueprintType)
struct FRadioLine
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FName SpeakerId;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FText Subtitle;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	int32 Priority = 0;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnRadioLinePlayed, const FRadioLine&, Line);

UCLASS()
class SKYWARRIOR_API URadioSubsystem : public UWorldSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Radio")
	void QueueRadioLine(const FRadioLine& Line);

	UFUNCTION(BlueprintCallable, Category = "Radio")
	void PlayNextLine();

	UPROPERTY(BlueprintAssignable, Category = "Radio")
	FOnRadioLinePlayed OnRadioLinePlayed;

protected:
	virtual bool DoesSupportWorldType(EWorldType::Type WorldType) const override;

private:
	TArray<FRadioLine> PendingLines;
};
