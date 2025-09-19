/**
 * AI-related types for the application
 */

// Waste Classification
export interface ClassifyWasteImageOutput {
  category: 'wet' | 'dry' | 'hazardous';
  confidence: number;
  recyclable?: boolean;
  disposalGuidelines?: string;
}

// Chatbot
export interface TrainingChatbotAssistanceInput {
  query: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  module?: string;
}

export interface TrainingChatbotAssistanceOutput {
  response: string;
}

// Hotspot Prediction
export interface HotspotPredictionInput {
  location?: {
    latitude: number;
    longitude: number;
  };
  reportHistory?: {
    timestamp: string;
    wasteVolume: number;
  }[];
  recentReports?: Array<{
    location: string;
    category: string;
    description?: string;
  }>;
}

export interface HotspotPredictionOutput {
  prediction?: {
    isHotspot: boolean;
    confidence: number;
    recommendedAction: string;
  };
  // Additional properties used in the component
  predictedHotspots: Array<{
    location: string;
    severity: 'High' | 'Medium' | 'Low';
    reasoning: string;
  }>;
}

// Donation Item Classification
export interface ClassifyDonationItemInput {
  photoDataUri: string;
}

export interface ClassifyDonationItemOutput {
  itemType?: string;
  condition?: string;
  estimatedValue?: number;
  acceptableForDonation?: boolean;
  recommendedActions?: string;
  // Additional properties being used in wow page
  category: string;
  suggestedTitle: string;
}
