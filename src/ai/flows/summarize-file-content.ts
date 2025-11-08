'use server';

/**
 * @fileOverview Summarizes the content of a given file.
 *
 * - summarizeFileContent - A function that takes a file data URI and returns a summary.
 * - SummarizeFileContentInput - The input type for the summarizeFileContent function.
 * - SummarizeFileContentOutput - The return type for the summarizeFileContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFileContentInputSchema = z.object({
  fileDataUri: z.string().describe("A file encoded as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  language: z.string().optional().describe('The language to summarize the content in. If not specified, defaults to English.'),
});
export type SummarizeFileContentInput = z.infer<typeof SummarizeFileContentInputSchema>;

const SummarizeFileContentOutputSchema = z.object({
  summary: z.string().describe('A summary of the file content between 500 and 600 words.'),
});
export type SummarizeFileContentOutput = z.infer<typeof SummarizeFileContentOutputSchema>;

export async function summarizeFileContent(input: SummarizeFileContentInput): Promise<SummarizeFileContentOutput> {
  return summarizeFileContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFileContentPrompt',
  input: {schema: SummarizeFileContentInputSchema},
  output: {schema: SummarizeFileContentOutputSchema},
  prompt: `Summarize the content of the following file in {{{language}}}. The summary must be between 500 and 600 words.\n\nFile: {{media url=fileDataUri}}`,
});

const summarizeFileContentFlow = ai.defineFlow(
  {
    name: 'summarizeFileContentFlow',
    inputSchema: SummarizeFileContentInputSchema,
    outputSchema: SummarizeFileContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
