'use server';

/**
 * This file provides server-side API functions that safely wrap our AI functionality
 * to ensure proper handling of server vs. client boundaries
 */

import * as serverAI from '@/ai/server';

/**
 * Process an image for waste classification
 */
export async function classifyWasteImage(imageBuffer: Buffer) {
  return serverAI.classifyWasteImage(imageBuffer);
}

/**
 * Process hotspot prediction data
 */
export async function predictHotspots(input: Parameters<typeof serverAI.predictHotspots>[0]) {
  return serverAI.predictHotspots(input);
}

/**
 * Get chatbot response for training assistance
 */
export async function getTrainingChatbotResponse(
  query: string, 
  history?: { role: string; content: string }[]
) {
  return serverAI.getTrainingChatbotResponse({
    query,
    history: history?.map(item => ({
      role: item.role === 'user' ? 'user' as const : 'assistant' as const,
      content: item.content
    })) || []
  });
}

/**
 * Process donation item classification
 */
export async function classifyDonationItem(imageBuffer: Buffer) {
  return serverAI.classifyDonationItem(imageBuffer);
}
