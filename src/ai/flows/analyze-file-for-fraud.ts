'use server';

/**
 * @fileOverview Analyzes a file for potential fraud and provides a fraud percentage and explanation.
 *
 * - analyzeFileForFraud - A function that takes a file data URI and returns a fraud analysis.
 * - AnalyzeFileForFraudInput - The input type for the analyzeFileForFraud function.
 * - AnalyzeFileForFraudOutput - The return type for the analyzeFileForFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFileForFraudInputSchema = z.object({
  fileDataUri: z.string().describe("A file encoded as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeFileForFraudInput = z.infer<typeof AnalyzeFileForFraudInputSchema>;

const AnalyzeFileForFraudOutputSchema = z.object({
  verdict: z.enum(['Real', 'Fraudulent', 'Unsure']).describe('The verdict on whether the content is real, fraudulent, or if the model is unsure.'),
  fraudPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe('The percentage indicating the likelihood of the content being fraudulent.'),
  explanation: z.string().describe('Explanation for the verdict.'),
});
export type AnalyzeFileForFraudOutput = z.infer<typeof AnalyzeFileForFraudOutputSchema>;

export async function analyzeFileForFraud(input: AnalyzeFileForFraudInput): Promise<AnalyzeFileForFraudOutput> {
  return analyzeFileForFraudFlow(input);
}

const analyzeFileForFraudPrompt = ai.definePrompt({
  name: 'analyzeFileForFraudPrompt',
  input: {schema: AnalyzeFileForFraudInputSchema},
  output: {schema: AnalyzeFileForFraudOutputSchema},
  prompt: `You are an AI assistant specializing in detecting fraudulent information in documents. Analyze the following file content and determine if it contains misinformation.

You must provide a clear verdict: 'Real', 'Fraudulent', or 'Unsure'.
Provide a detailed explanation for your verdict.

File Content: {{media url=fileDataUri}}`,
});

const analyzeFileForFraudFlow = ai.defineFlow(
  {
    name: 'analyzeFileForFraudFlow',
    inputSchema: AnalyzeFileForFraudInputSchema,
    outputSchema: AnalyzeFileForFraudOutputSchema,
  },
  async input => {
    const {output} = await analyzeFileForFraudPrompt(input);
    return output!;
  }
);
