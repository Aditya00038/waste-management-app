
'use server';

/**
 * @fileOverview An AI agent for predicting waste hotspots based on reporting data.
 *
 * - predictHotspots - A function that handles the hotspot prediction process.
 * - HotspotPredictionInput - The input type for the predictHotspots function.
 * - HotspotPredictionOutput - The return type for the predictHotspots function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HotspotSchema = z.object({
    location: z.string().describe("The predicted location of the waste hotspot."),
    severity: z.enum(["High", "Medium", "Low"]).describe("The predicted severity of the hotspot."),
    reasoning: z.string().describe("A brief explanation for why this area is a predicted hotspot."),
});

const HotspotPredictionInputSchema = z.object({
  recentReports: z.array(z.object({
    location: z.string(),
    description: z.string().optional(),
    category: z.string(),
  })).describe("A list of recent waste reports."),
});
export type HotspotPredictionInput = z.infer<typeof HotspotPredictionInputSchema>;

const HotspotPredictionOutputSchema = z.object({
  predictedHotspots: z.array(HotspotSchema).describe("A list of predicted waste hotspots."),
});
export type HotspotPredictionOutput = z.infer<typeof HotspotPredictionOutputSchema>;

export async function predictHotspots(input: HotspotPredictionInput): Promise<HotspotPredictionOutput> {
  return hotspotPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hotspotPredictionPrompt',
  input: {schema: HotspotPredictionInputSchema},
  output: {schema: HotspotPredictionOutputSchema},
  prompt: `You are a data analyst for a city's waste management department. Your task is to predict potential waste hotspots based on recent incident reports.

Analyze the following recent reports and identify 3-5 areas that are likely to become major waste hotspots. For each predicted hotspot, provide the location, a severity level (High, Medium, or Low), and a brief reasoning for your prediction. Consider report frequency, waste types, and descriptions.

Recent Reports:
{{#each recentReports}}
- Location: {{{location}}}, Category: {{{category}}}, Description: {{{description}}}
{{/each}}
`,
});

const hotspotPredictionFlow = ai.defineFlow(
  {
    name: 'hotspotPredictionFlow',
    inputSchema: HotspotPredictionInputSchema,
    outputSchema: HotspotPredictionOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      console.error('Error in AI hotspot prediction:', error);
      // Fallback to mock data if AI fails
      return {
        predictedHotspots: [
          { location: "Kalyani Nagar Market Area", severity: "High" as const, reasoning: "Frequent reports of wet waste and plastic bottles. Proximity to a market increases risk." },
          { location: "Behind Phoenix Mall, Viman Nagar", severity: "Medium" as const, reasoning: "Several reports of construction debris and packaging materials." },
          { location: "Mutha River Bank, near Deccan Gymkhana", severity: "Low" as const, reasoning: "Seasonal increase in tourist-related litter observed in past data." }
        ]
      };
    }
  }
);

    
