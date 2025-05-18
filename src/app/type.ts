export const ConstructionType = {
	New: "new",
	Extension: "extension",
	Reconstruction: "reconstruction",
	ChangeOfUse: "changeOfUse",
};

export type InspectionResult = {
	automaticFireAlarmSystem: {
		installationObligation: boolean;
		basisOfJudgment: string;
		installationStandard: string;
		structureSpecification: string;
	};
};
