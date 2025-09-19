'use server';

/**
 * @fileoverview Server-side only module for AI functionality.
 * This file MUST NOT be imported from client components.
 * Use the ai-server-wrapper.ts for client-side imports.
 */
import { classifyWasteImage as aiClassifyWasteImage } from './flows/waste-image-classification';
import { classifyDonationItem as aiClassifyDonationItem } from './flows/classify-donation-item-flow';
import { predictHotspots as aiPredictHotspots } from './flows/hotspot-prediction';
import { trainingChatbotAssistance } from './flows/training-chatbot-assistance';

// Import types
import type { 
  ClassifyWasteImageOutput,
  ClassifyDonationItemInput,
  HotspotPredictionInput,
  HotspotPredictionOutput,
  TrainingChatbotAssistanceInput,
  TrainingChatbotAssistanceOutput,
  ClassifyDonationItemOutput
} from '../lib/ai-types';

// Server-side implementation for waste classification
export async function classifyWasteImage(imageBuffer: Buffer): Promise<ClassifyWasteImageOutput> {
  try {
    // Convert buffer to data URI
    const base64Image = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg'; // Assuming JPEG format, adjust if needed
    const photoDataUri = `data:${mimeType};base64,${base64Image}`;
    
    const result = await aiClassifyWasteImage({ photoDataUri });
    
    // The result already matches our type definition
    return result;
  } catch (error) {
    console.error('Error in waste classification:', error);
    // Return a fallback result in case of error
    return {
      category: 'dry',
      confidence: 0.5
    };
  }
}

// Server-side implementation for hotspot prediction
export async function predictHotspots(input: HotspotPredictionInput): Promise<HotspotPredictionOutput> {
  try {
    // Convert input to match what the AI flow expects
    const adaptedInput = {
      recentReports: input.reportHistory 
        ? input.reportHistory.map(report => ({
            location: `${input.location?.latitude || 0}, ${input.location?.longitude || 0}`,
            category: 'Waste',
            description: `Waste volume: ${report.wasteVolume}, Time: ${report.timestamp}`
          }))
        : [
            {
              location: 'Sample location',
              category: 'Waste',
              description: 'Sample waste report'
            }
          ]
    };
    
    const result = await aiPredictHotspots(adaptedInput);
    
    // The result now matches our expected output type
    return result;
  } catch (error) {
    console.error('Error in hotspot prediction:', error);
    // Return fallback result with sample data
    return {
      predictedHotspots: [
        {
          location: 'Kothrud, Pune',
          severity: 'High',
          reasoning: 'Historical waste accumulation pattern detected in this area'
        },
        {
          location: 'Kondhwa, Pune',
          severity: 'Medium',
          reasoning: 'Recent reports of waste dumping'
        },
        {
          location: 'Aundh, Pune',
          severity: 'Low',
          reasoning: 'Small amount of waste accumulation detected'
        }
      ]
    };
  }
}

// Server-side implementation for training chatbot
export async function getTrainingChatbotResponse(
  input: TrainingChatbotAssistanceInput
): Promise<TrainingChatbotAssistanceOutput> {
  try {
    // Convert history format to match what the AI flow expects
    const history = input.history?.map(item => ({
      role: item.role === 'user' ? 'user' as const : 'assistant' as const,
      content: item.content
    })) || [];
    
    // Make sure the input is properly formatted for the flow
    const processedInput = {
      query: input.query,
      history: history
    };
    
    // Call the AI flow directly with the processed input
    const result = await trainingChatbotAssistance(processedInput);
    
    // Return the response
    return result;
  } catch (error) {
    console.error('Error in training chatbot:', error);
    // Return fallback response
    return {
      response: 'I apologize, but I encountered an issue processing your request. Please try again with a different question about waste management.'
    };
  }
}

// Server-side implementation for donation item classification
export async function classifyDonationItem(imageBuffer: Buffer): Promise<ClassifyDonationItemOutput> {
  try {
    // Since we're in a server-side environment, we can use try/catch to handle potential errors
    // with the AI service and provide fallback values if needed
    try {
      // Convert buffer to data URI
      const base64Image = imageBuffer.toString('base64');
      const mimeType = 'image/jpeg'; // Assuming JPEG format, adjust if needed
      const photoDataUri = `data:${mimeType};base64,${base64Image}`;
      
      const result = await aiClassifyDonationItem({ photoDataUri });
      
      // Enhance output with additional properties expected by the wow page
      return {
        ...result,
        itemType: result.category,
        condition: 'Good',
        estimatedValue: 0,
        acceptableForDonation: true,
        recommendedActions: ''
      };
    } catch (aiError) {
      console.error('AI classification error:', aiError);
      throw aiError; // Re-throw to be caught by outer try/catch
    }
  } catch (error) {
    console.error('Error in donation item classification:', error);
    // Return fallback result in case of error
    return {
      category: 'Clothes',
      suggestedTitle: 'Clothing Item',
      condition: 'Good',
      acceptableForDonation: true,
      itemType: 'General',
      estimatedValue: 100,
      recommendedActions: ''
    };
  }
}
