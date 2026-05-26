using UnrealBuildTool;

public class SkyWarrior : ModuleRules
{
	public SkyWarrior(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[]
		{
			"Core",
			"CoreUObject",
			"Engine",
			"InputCore",
			"EnhancedInput",
			"UMG",
			"Slate",
			"SlateCore",
			"CommonUI",
			"Niagara",
			"Json",
			"JsonUtilities"
		});

		PrivateDependencyModuleNames.AddRange(new string[]
		{
			"GameplayTasks",
			"AIModule"
		});

		PublicIncludePaths.AddRange(new string[]
		{
			"SkyWarrior/Flight",
			"SkyWarrior/Weapons",
			"SkyWarrior/AI",
			"SkyWarrior/Mission",
			"SkyWarrior/UI",
			"SkyWarrior/Meta",
			"SkyWarrior/Audio"
		});
	}
}
