using UnrealBuildTool;
using System.Collections.Generic;

public class SkyWarriorTarget : TargetRules
{
	public SkyWarriorTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Game;
		DefaultBuildSettings = BuildSettingsVersion.V5;
		IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_5;
		ExtraModuleNames.Add("SkyWarrior");
	}
}
