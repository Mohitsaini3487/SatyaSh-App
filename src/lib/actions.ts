'use server';

import { analyzeNewsForFraud as analyzeNewsForFraudFlow } from '@/ai/flows/analyze-news-for-fraud';
import type { AnalyzeNewsForFraudInput, AnalyzeNewsForFraudOutput } from '@/ai/flows/analyze-news-for-fraud';

import { summarizeText as summarizeTextFlow } from '@/ai/flows/summarize-text';
import type { SummarizeTextInput, SummarizeTextOutput } from '@/ai/flows/summarize-text';

import { summarizeLinkContent as summarizeLinkContentFlow } from '@/ai/flows/summarize-link-content';
import type { SummarizeLinkContentInput, SummarizeLinkContentOutput } from '@/ai/flows/summarize-link-content';

import { multilingualChatbot as multilingualChatbotFlow } from '@/ai/flows/multilingual-ai-chatbot';
import type { MultilingualChatbotInput, MultilingualChatbotOutput } from '@/ai/flows/multilingual-ai-chatbot';

import { analyzeFileForFraud as analyzeFileForFraudFlow } from '@/ai/flows/analyze-file-for-fraud';
import type { AnalyzeFileForFraudInput, AnalyzeFileForFraudOutput } from '@/ai/flows/analyze-file-for-fraud';

import { analyzeVideoForFraud as analyzeVideoForFraudFlow } from '@/ai/flows/analyze-video-for-fraud';
import type { AnalyzeVideoForFraudInput, AnalyzeVideoForFraudOutput } from '@/ai/flows/analyze-video-for-fraud';

import { summarizeFileContent as summarizeFileContentFlow } from '@/ai/flows/summarize-file-content';
import type { SummarizeFileContentInput, SummarizeFileContentOutput } from '@/ai/flows/summarize-file-content';

import { summarizeVideoContent as summarizeVideoContentFlow } from '@/ai/flows/summarize-video-content';
import type { SummarizeVideoContentInput, SummarizeVideoContentOutput } from '@/ai/flows/summarize-video-content';

import { generateNewsArticles as generateNewsArticlesFlow } from '@/ai/flows/generate-news-articles';
import type { GenerateNewsArticlesOutput } from '@/ai/flows/generate-news-articles';

import { textToSpeech as textToSpeechFlow } from '@/ai/flows/text-to-speech';
import type { TextToSpeechInput, TextToSpeechOutput } from '@/ai/flows/text-to-speech';


export async function analyzeNewsForFraud(input: AnalyzeNewsForFraudInput): Promise<AnalyzeNewsForFraudOutput> {
  // Add any server-side validation or logic here
  return await analyzeNewsForFraudFlow(input);
}

export async function summarizeText(input: SummarizeTextInput): Promise<SummarizeTextOutput> {
  return await summarizeTextFlow(input);
}

export async function summarizeLinkContent(input: SummarizeLinkContentInput): Promise<SummarizeLinkContentOutput> {
  return await summarizeLinkContentFlow(input);
}

export async function multilingualChatbot(input: MultilingualChatbotInput): Promise<MultilingualChatbotOutput> {
  return await multilingualChatbotFlow(input);
}

export async function analyzeFileForFraud(input: AnalyzeFileForFraudInput): Promise<AnalyzeFileForFraudOutput> {
  return await analyzeFileForFraudFlow(input);
}

export async function analyzeVideoForFraud(input: AnalyzeVideoForFraudInput): Promise<AnalyzeVideoForFraudOutput> {
  return await analyzeVideoForFraudFlow(input);
}

export async function summarizeFileContent(input: SummarizeFileContentInput): Promise<SummarizeFileContentOutput> {
    return await summarizeFileContentFlow(input);
}

export async function summarizeVideoContent(input: SummarizeVideoContentInput): Promise<SummarizeVideoContentOutput> {
    return await summarizeVideoContentFlow(input);
}

export async function generateNewsArticles(): Promise<GenerateNewsArticlesOutput> {
    return await generateNewsArticlesFlow();
}

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
    return await textToSpeechFlow(input);
}
