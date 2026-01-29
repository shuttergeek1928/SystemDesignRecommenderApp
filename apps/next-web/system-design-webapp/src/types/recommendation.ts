export interface ArchitectureChoice {
    component: string;
    selection: string;
    rationale: string;
    alternatives: string[];
    pros: string[];
    cons: string[];
}

export interface TradeOff {
    factor: string;
    choiceA: string;
    choiceB: string;
    impact: string;
}

export interface RecommendationDetail {
    id: string;
    title: string;
    description: string;
    confidenceScore: number;
    architecture: ArchitectureChoice[];
    tradeOffs: TradeOff[];
    productivityImpact: {
        learningCurve: "Low" | "Medium" | "High";
        maintenanceEffort: "Low" | "Medium" | "High";
        developmentSpeed: "Fast" | "Balanced" | "Steady";
    };
    deploymentStrategy: string;
}

export interface RecommendationResponse {
    recommendations: RecommendationDetail[];
    metadata: {
        processingTime: string;
        engineVersion: string;
    };
}
