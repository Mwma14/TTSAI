export interface ScriptSection {
  title: string;
  content: string; // The Burmese text mixed with English directions
  cleanText: string; // The Burmese text ONLY (for TTS)
}

export interface ProductionPlan {
  modelName: string;
  justification: string;
  styleInstruction: string;
}

export interface VoiceAnalysisResult {
  productionPlan: ProductionPlan;
  scriptSections: ScriptSection[];
}
