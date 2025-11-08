'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-text.ts';
import '@/ai/flows/analyze-news-for-fraud.ts';
import '@/ai/flows/multilingual-ai-chatbot.ts';
import '@/ai/flows/summarize-link-content.ts';
import '@/ai/flows/analyze-file-for-fraud.ts';
import '@/ai/flows/analyze-video-for-fraud.ts';
import '@/ai/flows/summarize-file-content.ts';
import '@/ai/flows/summarize-video-content.ts';
import '@/ai/flows/generate-news-articles.ts';
import '@/ai/flows/text-to-speech.ts';
