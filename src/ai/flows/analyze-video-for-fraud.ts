'use server';

/**
 * @fileOverview Analyzes a video for potential fraud (e.g., deepfakes, misinformation) and provides a fraud percentage and explanation.
 *
 * - analyzeVideoForFraud - A function that takes a video data URI and returns a fraud analysis.
 * - AnalyzeVideoForFraudInput - The input type for the analyzeVideoForFraud function.
 * - AnalyzeVideoForFraudOutput - The return type for the analyzeVideoForFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeVideoForFraudInputSchema = z.object({
  videoDataUri: z.string().describe("A video encoded as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeVideoForFraudInput = z.infer<typeof AnalyzeVideoForFraudInputSchema>;

const AnalyzeVideoForFraudOutputSchema = z.object({
  verdict: z.enum(['Real', 'Fraudulent', 'Unsure']).describe('The verdict on whether the video is real, fraudulent (e.g., deepfake), or if the model is unsure.'),
  fraudPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe('The percentage indicating the likelihood of the video being fraudulent.'),
  explanation: z.string().describe('Explanation for the verdict, highlighting any signs of manipulation or misinformation.'),
});
export type AnalyzeVideoForFraudOutput = z.infer<typeof AnalyzeVideoForFraudOutputSchema>;

export async function analyzeVideoForFraud(input: AnalyzeVideoForFraudInput): Promise<AnalyzeVideoForFraudOutput> {
  return analyzeVideoForFraudFlow(input);
}

const analyzeVideoForFraudPrompt = ai.definePrompt({
  name: 'analyzeVideoForFraudPrompt',
  input: {schema: AnalyzeVideoForFraudInputSchema},
  output: {schema: AnalyzeVideoForFraudOutputSchema},
  prompt: `You are an AI expert in detecting video manipulation and misinformation. Analyze the following video to determine if it is authentic or fraudulent (e.g., a deepfake, manipulated content).

You must provide a clear verdict: 'Real', 'Fraudulent', or 'Unsure'.
Provide a detailed explanation for your verdict, pointing out any visual artifacts, audio inconsistencies, or contextual clues that support your analysis.

Video: {{media url=videoDataUri}}`,
});

const analyzeVideoForFraudFlow = ai.defineFlow(
  {
    name: 'analyzeVideoForFraudFlow',
    inputSchema: AnalyzeVideoForFraudInputSchema,
    outputSchema: AnalyzeVideoForFraudOutputSchema,
  },
  async input => {
    const {output} = await analyzeVideoForFraudPrompt(input);
    return output!;
  }
);
