'use server';

/**
 * @fileOverview Summarizes the content of a given video.
 *
 * - summarizeVideoContent - A function that takes a video data URI and returns a summary.
 * - SummarizeVideoContentInput - The input type for the summarizeVideoContent function.
 * - SummarizeVideoContentOutput - The return type for the summarizeVideoContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeVideoContentInputSchema = z.object({
  videoDataUri: z.string().describe("A video encoded as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  language: z.string().optional().describe('The language to summarize the content in. If not specified, defaults to English.'),
});
export type SummarizeVideoContentInput = z.infer<typeof SummarizeVideoContentInputSchema>;

const SummarizeVideoContentOutputSchema = z.object({
  summary: z.string().describe('A summary of the video content between 500 and 600 words.'),
});
export type SummarizeVideoContentOutput = z.infer<typeof SummarizeVideoContentOutputSchema>;

export async function summarizeVideoContent(input: SummarizeVideoContentInput): Promise<SummarizeVideoContentOutput> {
  return summarizeVideoContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeVideoContentPrompt',
  input: {schema: SummarizeVideoContentInputSchema},
  output: {schema: SummarizeVideoContentOutputSchema},
  prompt: `Summarize the content of the following video in {{{language}}}. The summary must be between 500 and 600 words.\n\nVideo: {{media url=videoDataUri}}`,
});

const summarizeVideoContentFlow = ai.defineFlow(
  {
    name: 'summarizeVideoContentFlow',
    inputSchema: SummarizeVideoContentInputSchema,
    outputSchema: SummarizeVideoContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
