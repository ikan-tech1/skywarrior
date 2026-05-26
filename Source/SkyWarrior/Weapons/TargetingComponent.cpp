#include "Weapons/TargetingComponent.h"
#include "Weapons/LockMath.h"
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

float UTargetingComponent::GetTargetDistanceMeters() const
{
	if (!CurrentTarget.IsValid() || !GetOwner())
	{
		return -1.f;
	}

	return FVector::Dist(GetOwner()->GetActorLocation(), CurrentTarget->GetActorLocation()) / 100.f;
}

bool UTargetingComponent::IsTargetInCone(AActor* Target) const
{
	if (!Target || !GetOwner())
	{
		return false;
	}

	return SkyWarriorLockMath::IsTargetInLockCone(
		GetOwner()->GetActorLocation(),
		GetOwner()->GetActorForwardVector(),
		Target->GetActorLocation(),
		LockConeDegrees);
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
		LockProgress = SkyWarriorLockMath::LockProgressForDeltaTime(LockProgress, DeltaTime, LockTimeSeconds);
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

FVector UTargetingComponent::GetLeadAimPoint(float ProjectileSpeedMetersPerSec) const
{
	if (!GetOwner() || !CurrentTarget.IsValid())
	{
		return GetOwner() ? GetOwner()->GetActorLocation() + GetOwner()->GetActorForwardVector() * 5000.f : FVector::ZeroVector;
	}

	AActor* Target = CurrentTarget.Get();
	const FVector TargetVel = Target->GetVelocity();
	const FVector ShooterVel = GetOwner()->GetVelocity();

	return SkyWarriorLockMath::ComputeLeadAimPoint(
		GetOwner()->GetActorLocation(),
		ShooterVel,
		Target->GetActorLocation(),
		TargetVel,
		ProjectileSpeedMetersPerSec);
}

void UTargetingComponent::TickComponent(float DeltaTime, ELevelTick TickType,
	FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);
	UpdateLock(DeltaTime);
}
