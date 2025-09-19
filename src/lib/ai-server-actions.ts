'use server';

// Import server-side AI functions through the wrapper
import * as serverAI from '@/lib/ai-server-wrapper';

/**
 * Server action for waste image classification
 * This keeps all genkit processing on the server-side
 */
export async function classifyWasteImage(formData: FormData) {
  try {
    const image = formData.get('image') as File;
    if (!image) {
      throw new Error('No image provided');
    }

    // Process with server-side AI
    const buffer = await image.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    // Use our server-side implementation that handles errors gracefully
    const result = await serverAI.classifyWasteImage(imageBuffer);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Waste classification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Server action for hotspot prediction
 */
export async function predictHotspots(data: any) {
  try {
    // Use our server-side implementation that handles errors gracefully
    const result = await serverAI.predictHotspots(data);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Hotspot prediction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Server action for training chatbot
 */
export async function getTrainingChatbotResponse(message: string, history?: { role: string; content: string }[]) {
  try {
    // Use our server-side implementation that handles errors gracefully
    const result = await serverAI.getTrainingChatbotResponse({
      query: message,
      history: history || []
    });

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Chatbot response error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Server action for donation item classification
 */
export async function classifyDonationItem(formData: FormData) {
  try {
    const image = formData.get('image') as File;
    if (!image) {
      throw new Error('No image provided');
    }

    const buffer = await image.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    // Use our server-side implementation that handles errors gracefully
    const result = await serverAI.classifyDonationItem(imageBuffer);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Donation classification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
