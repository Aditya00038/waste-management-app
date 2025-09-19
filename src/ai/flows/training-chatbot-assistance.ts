'use server';

/**
 * @fileOverview An AI chatbot for guiding users through training modules on waste disposal and handling.
 *
 * - trainingChatbotAssistance - A function that handles the chatbot assistance.
 * - TrainingChatbotAssistanceInput - The input type for the trainingChatbotAssistance function.
 * - TrainingChatbotAssistanceOutput - The return type for the trainingChatbotAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrainingChatbotAssistanceInputSchema = z.object({
  query: z.string().describe('The user query or message for the chatbot.'),
  module: z
    .string()
    .optional()
    .describe('The name of the training module the user is currently in.'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Chat history'),
});
export type TrainingChatbotAssistanceInput = z.infer<
  typeof TrainingChatbotAssistanceInputSchema
>;

const TrainingChatbotAssistanceOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user query.'),
});
export type TrainingChatbotAssistanceOutput = z.infer<
  typeof TrainingChatbotAssistanceOutputSchema
>;

export async function trainingChatbotAssistance(
  input: TrainingChatbotAssistanceInput
): Promise<TrainingChatbotAssistanceOutput> {
  return trainingChatbotAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'trainingChatbotAssistancePrompt',
  input: {
    schema: TrainingChatbotAssistanceInputSchema,
  },
  output: {schema: TrainingChatbotAssistanceOutputSchema},
  prompt: `You are a helpful AI chatbot designed to guide users through training modules on proper waste disposal and handling procedures. You are an expert in Indian waste management rules and regulations.

  You should answer the users question based on the training module they are currently in. If no module is specified, you can answer general questions. Be friendly, concise, and encouraging.

  Current module: {{{module}}}

  The following is the chat history:
  {{#each history}}
    {{#if (eq role "user")}}
      User: {{{content}}}
    {{else}}
      Assistant: {{{content}}}
    {{/if}}
  {{/each}}

  User Query: {{{query}}}
  Response: `,
});

const trainingChatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'trainingChatbotAssistanceFlow',
    inputSchema: TrainingChatbotAssistanceInputSchema,
    outputSchema: TrainingChatbotAssistanceOutputSchema,
  },
  async input => {
    const {
      output,
    } = await prompt(input);
    return {
      response: output!.response,
    };
  }
);
