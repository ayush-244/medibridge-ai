export interface RecommendSpecialistRequest {
  patient_id: string;
}

export interface RecommendationCitation {
  fileName: string;
  chunkIndex: number;
}

export interface SpecialistRecommendation {
  specialist: string;
  recommendedSpecialist: string;
  confidence: number;
  reason: string;
  supportingEvidence: RecommendationCitation[];
}
