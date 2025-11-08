'use client';

import { useState, useRef } from 'react';
import { summarizeText, summarizeLinkContent, summarizeFileContent, summarizeVideoContent } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, FileUp, Video } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebase } from '@/firebase/provider';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';

const languages = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi (हिन्दी)' },
    { value: 'Bengali', label: 'Bengali (বাংলা)' },
    { value: 'Marathi', label: 'Marathi (मराठी)' },
    { value: 'Telugu', label: 'Telugu (తెలుగు)' },
    { value: 'Tamil', label: 'Tamil (தமிழ்)' },
    { value: 'Gujarati', label: 'Gujarati (ગુજરાતી)' },
    { value: 'Urdu', label: 'Urdu (اردو)' },
    { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
    { value: 'Odia', label: 'Odia (ଓଡ଼ିଆ)' },
    { value: 'Malayalam', label: 'Malayalam (മലയാളം)' },
];

export default function SummarizerPage() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [fileName, setFileName] = useState('');
  const [videoName, setVideoName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoName(file.name);
    } else {
      setVideoName('');
    }
  };

  const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  async function handleSummarize(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
     if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to generate a summary.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    setSummary('');

    const formData = new FormData(event.currentTarget);
    const mode = activeTab;
    const language = formData.get('language') as string;
    let inputContent = '';

    try {
      let result;
      if (mode === 'text') {
        const text = formData.get('textToSummarize') as string;
        inputContent = text;
        if (!text.trim()) {
            toast({ title: "Error", description: "Text cannot be empty.", variant: "destructive" });
            return;
        }
        result = await summarizeText({ text, language });
      } else if (mode === 'link') {
        const url = formData.get('linkToSummarize') as string;
        inputContent = url;
        if (!url.trim()) {
            toast({ title: "Error", description: "URL cannot be empty.", variant: "destructive" });
            return;
        }
        result = await summarizeLinkContent({ url, language });
      } else if (mode === 'file') {
        const file = (formData.get('file') as File);
        if (!file || file.size === 0) {
            toast({ title: "Error", description: "Please select a file to summarize.", variant: "destructive" });
            return;
        }
        inputContent = file.name;
        const fileDataUri = await fileToDataURI(file);
        result = await summarizeFileContent({ fileDataUri, language });
      } else if (mode === 'video') {
        const videoFile = (formData.get('video') as File);
        if (!videoFile || videoFile.size === 0) {
            toast({ title: "Error", description: "Please select a video to summarize.", variant: "destructive" });
            return;
        }
        inputContent = videoFile.name;
        const videoDataUri = await fileToDataURI(videoFile);
        result = await summarizeVideoContent({ videoDataUri, language });
      }


      const summaryText = result?.summary || 'No summary could be generated.';
      setSummary(summaryText);

       if (firestore && user && result?.summary) {
        const historyCollection = collection(firestore, `users/${user.uid}/aiSummaryHistory`);
        addDocumentNonBlocking(historyCollection, {
            inputContent: inputContent,
            summarizedContent: summaryText,
            inputLanguage: 'N/A', // Or detect language if possible
            outputLanguage: language,
            summaryTimestamp: serverTimestamp(),
            userId: user.uid,
        });
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Summarization Failed",
        description: "Could not generate a summary. Please check your input and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-headline font-bold">AI Summarizer</h1>
        <p className="text-muted-foreground">
          Condense text, files, and links into concise summaries.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Summarizer Tool</CardTitle>
            <CardDescription>
              Provide your content and get a summary in your chosen language.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSummarize}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="link">Link</TabsTrigger>
                  <TabsTrigger value="file">File</TabsTrigger>
                  <TabsTrigger value="video">Video</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-6 space-y-4">
                  <Label htmlFor="textToSummarize">Paste Text</Label>
                  <Textarea
                    id="textToSummarize"
                    name="textToSummarize"
                    placeholder="Enter the text you want to summarize here..."
                    className="min-h-[200px]"
                    disabled={isLoading}
                  />
                </TabsContent>
                <TabsContent value="link" className="mt-6 space-y-4">
                    <Label htmlFor="linkToSummarize">Enter URL</Label>
                    <Input
                        id="linkToSummarize"
                        name="linkToSummarize"
                        placeholder="https://example.com/article"
                        type="url"
                        disabled={isLoading}
                    />
                </TabsContent>
                <TabsContent value="file" className="mt-6">
                    <Label htmlFor="file-upload">Upload File</Label>
                    <div 
                        className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10 cursor-pointer hover:border-primary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="text-center">
                        <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                            <p className="pl-1">{fileName ? `Selected: ${fileName}` : 'Upload a file (e.g., .txt, .pdf, .docx)'}</p>
                        </div>
                        <Input 
                            id="file-upload" 
                            name="file" 
                            type="file" 
                            className="sr-only" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            disabled={isLoading} 
                        />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="video" className="mt-6">
                    <Label htmlFor="video-upload">Upload Video</Label>
                    <div 
                        className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10 cursor-pointer hover:border-primary"
                        onClick={() => videoInputRef.current?.click()}
                    >
                        <div className="text-center">
                        <Video className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                           <p className="pl-1">{videoName ? `Selected: ${videoName}`: 'Upload a video file'}</p>
                        </div>
                         <Input 
                            id="video-upload" 
                            name="video" 
                            type="file"
                            accept="video/*"
                            className="sr-only" 
                            ref={videoInputRef}
                            onChange={handleVideoChange}
                            disabled={isLoading} 
                        />
                        </div>
                    </div>
                </TabsContent>
              </Tabs>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="language">Output Language</Label>
                  <Select name="language" defaultValue="English" disabled={isLoading}>
                      <SelectTrigger id="language">
                          <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                          {languages.map(lang => (
                              <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading || !user}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Summarize
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Generated Summary</CardTitle>
            <CardDescription>
              Your concise summary will appear below.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : summary ? (
              <div className="p-4 bg-secondary rounded-md text-sm text-secondary-foreground space-y-4 max-h-96 overflow-y-auto">
                <p>{summary}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>Your summary will be displayed here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
