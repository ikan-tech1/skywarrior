#include "Mission/CampaignAceActor.h"

ACampaignAceActor::ACampaignAceActor()
{
	PrimaryActorTick.bCanEverTick = false;
}

void ACampaignAceActor::AdvancePhase()
{
	if (CurrentPhase < MaxPhases)
	{
		CurrentPhase++;
	}
}
