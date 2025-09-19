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
  input: Parameters<typeof serverAI.getTrainingChatbotResponse>[0]
) {
  return serverAI.getTrainingChatbotResponse(input);
}

/**
 * Process donation item classification
 */
export async function classifyDonationItem(imageBuffer: Buffer) {
  return serverAI.classifyDonationItem(imageBuffer);
}
