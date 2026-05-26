#pragma once

#include "CoreMinimal.h"

/** Pure lock / lead math shared by targeting and weapon systems. */
namespace SkyWarriorLockMath
{
	inline float ConeDotThreshold(float ConeDegrees)
	{
		return FMath::Cos(FMath::DegreesToRadians(FMath::Clamp(ConeDegrees, 1.f, 179.f)));
	}

	inline bool IsTargetInLockCone(const FVector& OwnerLocation, const FVector& OwnerForward,
		const FVector& TargetLocation, float ConeDegrees)
	{
		const FVector ToTarget = (TargetLocation - OwnerLocation).GetSafeNormal();
		return FVector::DotProduct(OwnerForward.GetSafeNormal(), ToTarget) >= ConeDotThreshold(ConeDegrees);
	}

	/** Lead aim point for gun solution (constant-velocity target). */
	inline FVector ComputeLeadAimPoint(const FVector& ShooterLocation, const FVector& ShooterVelocity,
		const FVector& TargetLocation, const FVector& TargetVelocity, float ProjectileSpeedMetersPerSec)
	{
		const FVector ToTarget = TargetLocation - ShooterLocation;
		const FVector RelativeVelocity = TargetVelocity - ShooterVelocity;
		const float Speed = FMath::Max(ProjectileSpeedMetersPerSec, 1.f);

		// Quadratic time-of-flight for lead: |R + Vr*t| = Speed*t
		const float A = RelativeVelocity.SizeSquared() - Speed * Speed;
		const float B = 2.f * FVector::DotProduct(ToTarget, RelativeVelocity);
		const float C = ToTarget.SizeSquared();

		float TimeToImpact = ToTarget.Size() / Speed;
		if (FMath::Abs(A) > KINDA_SMALL_NUMBER)
		{
			const float Disc = B * B - 4.f * A * C;
			if (Disc >= 0.f)
			{
				const float SqrtDisc = FMath::Sqrt(Disc);
				const float T1 = (-B - SqrtDisc) / (2.f * A);
				const float T2 = (-B + SqrtDisc) / (2.f * A);
				if (T1 > 0.f)
				{
					TimeToImpact = T1;
				}
				else if (T2 > 0.f)
				{
					TimeToImpact = T2;
				}
			}
		}

		TimeToImpact = FMath::Clamp(TimeToImpact, 0.f, 8.f);
		return TargetLocation + TargetVelocity * TimeToImpact;
	}

	inline float LockProgressForDeltaTime(float CurrentProgress, float DeltaTime, float LockTimeSeconds)
	{
		return FMath::Clamp(CurrentProgress + DeltaTime / FMath::Max(LockTimeSeconds, 0.1f), 0.f, 1.f);
	}
}
