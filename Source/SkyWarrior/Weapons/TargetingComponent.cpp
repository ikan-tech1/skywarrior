#include "Weapons/TargetingComponent.h"
#include "AI/DamageableUnit.h"
#include "Kismet/GameplayStatics.h"

UTargetingComponent::UTargetingComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

void UTargetingComponent::BeginPlay()
{
	Super::BeginPlay();
	SetLockState(ELockState::Searching);
}

void UTargetingComponent::SetLockState(ELockState NewState)
{
	if (LockState != NewState)
	{
		LockState = NewState;
		OnLockStateChanged.Broadcast(NewState);
	}
}

bool UTargetingComponent::IsTargetInCone(AActor* Target) const
{
	if (!Target || !GetOwner())
	{
		return false;
	}

	const FVector ToTarget = (Target->GetActorLocation() - GetOwner()->GetActorLocation()).GetSafeNormal();
	const float Dot = FVector::DotProduct(GetOwner()->GetActorForwardVector(), ToTarget);
	const float ConeCos = FMath::Cos(FMath::DegreesToRadians(LockConeDegrees));
	return Dot >= ConeCos;
}

AActor* UTargetingComponent::FindBestTarget() const
{
	AActor* Best = nullptr;
	float BestDist = MAX_FLT;

	TArray<AActor*> Found;
	UGameplayStatics::GetAllActorsOfClass(GetWorld(), ADamageableUnit::StaticClass(), Found);

	for (AActor* Actor : Found)
	{
		if (Actor == GetOwner())
		{
			continue;
		}

		const float Dist = FVector::Dist(GetOwner()->GetActorLocation(), Actor->GetActorLocation());
		if (Dist <= MaxLockRangeMeters && Dist < BestDist && IsTargetInCone(Actor))
		{
			BestDist = Dist;
			Best = Actor;
		}
	}

	return Best;
}

void UTargetingComponent::UpdateLock(float DeltaTime)
{
	AActor* Candidate = FindBestTarget();
	if (!Candidate)
	{
		CurrentTarget = nullptr;
		LockProgress = 0.f;
		SetLockState(ELockState::Searching);
		return;
	}

	CurrentTarget = Candidate;

	if (LockState == ELockState::Searching || LockState == ELockState::Tracking)
	{
		SetLockState(ELockState::Tracking);
		LockProgress += DeltaTime / FMath::Max(LockTimeSeconds, 0.1f);
		if (LockProgress >= 1.f)
		{
			SetLockState(ELockState::Locked);
		}
	}
	else if (LockState == ELockState::Locked && !IsTargetInCone(Candidate))
	{
		SetLockState(ELockState::BreakLock);
		LockProgress = 0.f;
	}
	else if (LockState == ELockState::BreakLock)
	{
		SetLockState(ELockState::Searching);
	}
}

void UTargetingComponent::TickComponent(float DeltaTime, ELevelTick TickType,
	FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);
	UpdateLock(DeltaTime);
}
