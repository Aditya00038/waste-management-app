'use server';

/**
 * @fileOverview An AI agent for classifying waste images into categories (wet, dry, hazardous).
 *
 * - classifyWasteImage - A function that handles the waste image classification process.
 * - ClassifyWasteImageInput - The input type for the classifyWasteImage function.
 * - ClassifyWasteImageOutput - The return type for the classifyWasteImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyWasteImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of waste, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ClassifyWasteImageInput = z.infer<typeof ClassifyWasteImageInputSchema>;

const ClassifyWasteImageOutputSchema = z.object({
  category: z
    .enum(['wet', 'dry', 'hazardous'])
    .describe('The predicted waste category.'),
  confidence: z
    .number()
    .describe('The confidence score of the prediction (0-1).'),
});
export type ClassifyWasteImageOutput = z.infer<typeof ClassifyWasteImageOutputSchema>;

export async function classifyWasteImage(input: ClassifyWasteImageInput): Promise<ClassifyWasteImageOutput> {
  return classifyWasteImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyWasteImagePrompt',
  input: {schema: ClassifyWasteImageInputSchema},
  output: {schema: ClassifyWasteImageOutputSchema},
  prompt: `You are an expert in waste management and can accurately classify waste images.

  Analyze the provided image and classify it into one of the following categories: wet, dry, or hazardous.
  Also provide a confidence score (0-1) for your classification.

  Image: {{media url=photoDataUri}}
  Category: 
  Confidence:`, // Ensure LLM returns confidence score
});

const classifyWasteImageFlow = ai.defineFlow(
  {
    name: 'classifyWasteImageFlow',
    inputSchema: ClassifyWasteImageInputSchema,
    outputSchema: ClassifyWasteImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
