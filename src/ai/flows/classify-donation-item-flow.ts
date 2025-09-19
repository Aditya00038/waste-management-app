
'use server';

/**
 * @fileOverview An AI agent for classifying donated items from an image.
 *
 * - classifyDonationItem - A function that handles the donation item classification.
 * - ClassifyDonationItemInput - The input type for the classifyDonationItem function.
 * - ClassifyDonationItemOutput - The return type for the classifyDonationItem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyDonationItemInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a donated item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ClassifyDonationItemInput = z.infer<typeof ClassifyDonationItemInputSchema>;

const ClassifyDonationItemOutputSchema = z.object({
  category: z
    .enum(['Clothes', 'Books', 'Electronics', 'Furniture', 'Other'])
    .describe('The predicted category for the donated item.'),
  suggestedTitle: z.string().describe('A suggested, concise title for the item listing.'),
});
export type ClassifyDonationItemOutput = z.infer<typeof ClassifyDonationItemOutputSchema>;

export async function classifyDonationItem(input: ClassifyDonationItemInput): Promise<ClassifyDonationItemOutput> {
  return classifyDonationItemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyDonationItemPrompt',
  input: {schema: ClassifyDonationItemInputSchema},
  output: {schema: ClassifyDonationItemOutputSchema},
  prompt: `You are an expert at identifying and classifying items for a donation platform.

  Analyze the provided image and classify it into one of the following categories: Clothes, Books, Electronics, Furniture, or Other.
  
  Also, provide a short, catchy, and descriptive title for the item. For example, if you see a stack of t-shirts, suggest a title like "Collection of Men's T-Shirts" or for a single chair, "Sturdy Wooden Chair".

  Image: {{media url=photoDataUri}}`,
});

const classifyDonationItemFlow = ai.defineFlow(
  {
    name: 'classifyDonationItemFlow',
    inputSchema: ClassifyDonationItemInputSchema,
    outputSchema: ClassifyDonationItemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
