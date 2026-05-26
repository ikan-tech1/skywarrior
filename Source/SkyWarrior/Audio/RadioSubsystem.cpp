#include "Audio/RadioSubsystem.h"

bool URadioSubsystem::DoesSupportWorldType(EWorldType::Type WorldType) const
{
	return WorldType == EWorldType::Game || WorldType == EWorldType::PIE;
}

void URadioSubsystem::QueueRadioLine(const FRadioLine& Line)
{
	PendingLines.Add(Line);
	PendingLines.Sort([](const FRadioLine& A, const FRadioLine& B)
	{
		return A.Priority > B.Priority;
	});
}

void URadioSubsystem::PlayNextLine()
{
	if (PendingLines.Num() == 0)
	{
		return;
	}

	const FRadioLine Line = PendingLines[0];
	PendingLines.RemoveAt(0);
	OnRadioLinePlayed.Broadcast(Line);
}
