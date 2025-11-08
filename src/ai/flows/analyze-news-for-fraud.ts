'use server';

/**
 * @fileOverview Analyzes a news article for potential fraud and provides a fraud percentage and explanation.
 *
 * - analyzeNewsForFraud - A function that takes news content as input and returns a fraud analysis.
 * - AnalyzeNewsForFraudInput - The input type for the analyzeNewsForFraud function.
 * - AnalyzeNewsForFraudOutput - The return type for the analyzeNewsForFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeNewsForFraudInputSchema = z.object({
  newsContent: z.string().describe('The content of the news article to analyze.'),
});
export type AnalyzeNewsForFraudInput = z.infer<typeof AnalyzeNewsForFraudInputSchema>;

const AnalyzeNewsForFraudOutputSchema = z.object({
  verdict: z.enum(['Real', 'Fraudulent', 'Unsure']).describe('The verdict on whether the news is real, fraudulent, or if the model is unsure.'),
  fraudPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe('The percentage indicating the likelihood of the news being fraudulent. If the verdict is "Real", this should be low. If "Fraudulent", it should be high.'),
  explanation: z.string().describe('Explanation of why the article was flagged as potentially fraudulent or why it is considered real.'),
});
export type AnalyzeNewsForFraudOutput = z.infer<typeof AnalyzeNewsForFraudOutputSchema>;

export async function analyzeNewsForFraud(input: AnalyzeNewsForFraudInput): Promise<AnalyzeNewsForFraudOutput> {
  return analyzeNewsForFraudFlow(input);
}

const analyzeNewsForFraudPrompt = ai.definePrompt({
  name: 'analyzeNewsForFraudPrompt',
  input: {schema: AnalyzeNewsForFraudInputSchema},
  output: {schema: AnalyzeNewsForFraudOutputSchema},
  prompt: `You are an AI assistant specializing in detecting fake news. Your task is to analyze the following news article content and determine if it is real or fraudulent.

You must provide a clear verdict: 'Real', 'Fraudulent', or 'Unsure'.
- If the news is legitimate and factual, set the verdict to 'Real' and provide a low fraud percentage.
- If the news is misleading, fabricated, or a form of misinformation, set the verdict to 'Fraudulent' and provide a high fraud percentage.
- If you cannot determine with high confidence, set the verdict to 'Unsure'.

Provide a detailed explanation for your verdict, citing specific elements from the text (or lack thereof) that support your conclusion. Consider factors like tone, sourcing, unverifiable claims, and emotional language.

News Content: {{{newsContent}}}`,
});

const analyzeNewsForFraudFlow = ai.defineFlow(
  {
    name: 'analyzeNewsForFraudFlow',
    inputSchema: AnalyzeNewsForFraudInputSchema,
    outputSchema: AnalyzeNewsForFraudOutputSchema,
  },
  async input => {
    const {output} = await analyzeNewsForFraudPrompt(input);
    return output!;
  }
);
