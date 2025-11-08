'use server';

/**
 * @fileOverview Summarizes the content of a given URL.
 *
 * - summarizeLinkContent - A function that takes a URL and returns a summary of the content.
 * - SummarizeLinkContentInput - The input type for the summarizeLinkContent function.
 * - SummarizeLinkContentOutput - The return type for the summarizeLinkContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLinkContentInputSchema = z.object({
  url: z.string().url().describe('The URL of the content to summarize.'),
  language: z.string().optional().describe('The language to summarize the content in.  If not specified, defaults to English.'),
});
export type SummarizeLinkContentInput = z.infer<typeof SummarizeLinkContentInputSchema>;

const SummarizeLinkContentOutputSchema = z.object({
  summary: z.string().describe('A summary of the content at the given URL.'),
});
export type SummarizeLinkContentOutput = z.infer<typeof SummarizeLinkContentOutputSchema>;

export async function summarizeLinkContent(input: SummarizeLinkContentInput): Promise<SummarizeLinkContentOutput> {
  return summarizeLinkContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLinkContentPrompt',
  input: {schema: SummarizeLinkContentInputSchema},
  output: {schema: SummarizeLinkContentOutputSchema},
  prompt: `Summarize the content at the following URL in the language specified.  If no language is specified, use English.\n\nURL: {{{url}}}\nLanguage: {{{language}}}\n\nSummary: `,
});

const summarizeLinkContentFlow = ai.defineFlow(
  {
    name: 'summarizeLinkContentFlow',
    inputSchema: SummarizeLinkContentInputSchema,
    outputSchema: SummarizeLinkContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
