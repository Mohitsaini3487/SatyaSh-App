'use server';

/**
 * @fileOverview Generates a list of news articles on topics like misinformation and AI.
 *
 * - generateNewsArticles - A function that returns a list of generated news articles.
 * - NewsArticle - The type for a single news article.
 * - GenerateNewsArticlesOutput - The return type for the generateNewsArticles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NewsArticleSchema = z.object({
    id: z.string().describe('A unique identifier for the news article.'),
    title: z.string().describe('The headline of the news article.'),
    category: z.string().describe('The category of the news (e.g., Technology, Health, Politics).'),
    imageUrl: z.string().url().describe('A relevant image URL for the article.'),
    imageHint: z.string().describe('A one or two-word hint for the image content.'),
    description: z.string().describe('A brief, one-paragraph summary of the article.'),
    author: z.string().describe("The fictional author's name."),
    date: z.string().describe("The publication date in a user-friendly format (e.g., 'June 28, 2024')."),
});
export type NewsArticle = z.infer<typeof NewsArticleSchema>;

const GenerateNewsArticlesOutputSchema = z.object({
  articles: z.array(NewsArticleSchema),
});
export type GenerateNewsArticlesOutput = z.infer<typeof GenerateNewsArticlesOutputSchema>;


export async function generateNewsArticles(): Promise<GenerateNewsArticlesOutput> {
    return await generateNewsArticlesFlow();
}

const newsTopics = [
    "the latest advancements in AI-powered fact-checking.",
    "how deepfake technology is impacting social media.",
    "a case study of a recent viral misinformation campaign.",
    "the role of media literacy in combating fake news.",
    "new browser extensions for detecting AI-generated content.",
    "political misinformation trends in India.",
    "health myths that are currently spreading online.",
    "the use of AI in creating and debunking conspiracy theories.",
    "financial scams being propagated through social media.",
    "an analysis of how algorithms contribute to filter bubbles."
];

const generateNewsArticlesPrompt = ai.definePrompt({
  name: 'generateNewsArticlesPrompt',
  output: {schema: GenerateNewsArticlesOutputSchema},
  prompt: `You are a news content generator for an educational platform about fake news. Your task is to generate a list of 6 unique, insightful, and realistic-sounding news articles.

  The articles should cover various topics related to misinformation, fact-checking, and AI's role in information integrity.
  
  For each article, provide a unique ID, a compelling title, a relevant category, a plausible author, a recent date, a short descriptive paragraph (CardDescription), and an image URL from https://picsum.photos. The image URL should be in the format 'https://picsum.photos/seed/{seedId}/600/400' where {seedId} is a unique random number for each article. Also provide a two-word imageHint for each image.
  
  Here are some topics to inspire the articles. Ensure the generated articles are diverse and cover different angles of the misinformation problem.
  
  Topics:
  - ${newsTopics.join('\n- ')}
  
  Generate 6 articles.`,
});

const generateNewsArticlesFlow = ai.defineFlow(
  {
    name: 'generateNewsArticlesFlow',
    outputSchema: GenerateNewsArticlesOutputSchema,
  },
  async () => {
    const {output} = await generateNewsArticlesPrompt();
    return output!;
  }
);
