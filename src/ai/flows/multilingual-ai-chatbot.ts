'use server';

/**
 * @fileOverview A multilingual AI chatbot for user support and guidance in the top 10 Indian languages.
 *
 * - multilingualChatbot - A function that handles the chatbot interactions.
 * - MultilingualChatbotInput - The input type for the multilingualChatbot function.
 * - MultilingualChatbotOutput - The return type for the multilingualChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MultilingualChatbotInputSchema = z.object({
  language: z
    .string()
    .describe('The language in which the user wants to interact (one of the top 10 Indian languages).'),
  query: z.string().describe('The user query or message.'),
});
export type MultilingualChatbotInput = z.infer<typeof MultilingualChatbotInputSchema>;

const MultilingualChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response in the specified language.'),
});
export type MultilingualChatbotOutput = z.infer<typeof MultilingualChatbotOutputSchema>;

export async function multilingualChatbot(input: MultilingualChatbotInput): Promise<MultilingualChatbotOutput> {
  return multilingualChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'multilingualChatbotPrompt',
  input: {schema: MultilingualChatbotInputSchema},
  output: {schema: MultilingualChatbotOutputSchema},
  prompt: `You are a multilingual AI chatbot providing support and guidance in the top 10 Indian languages.

The user will provide their query in the following language: {{{language}}}.

Respond to the user's query in the same language.

User Query: {{{query}}}`,
});

const multilingualChatbotFlow = ai.defineFlow(
  {
    name: 'multilingualChatbotFlow',
    inputSchema: MultilingualChatbotInputSchema,
    outputSchema: MultilingualChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
