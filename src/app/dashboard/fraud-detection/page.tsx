'use client';

import { useState, useRef } from 'react';
import { analyzeNewsForFraud, summarizeLinkContent, analyzeFileForFraud, analyzeVideoForFraud } from '@/lib/actions';
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
import { Progress } from '@/components/ui/progress';
import { FileUp, Loader2, Video } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { Badge } from '@/components/ui/badge';
import { useFirebase } from '@/firebase/provider';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';
import { cn } from '@/lib/utils';

type AnalysisResult = {
  verdict: 'Real' | 'Fraudulent' | 'Unsure';
  fraudPercentage: number;
  explanation: string;
};

export default function FraudDetectionPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
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

  async function handleAnalysis(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to perform an analysis.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const mode = activeTab;
    let inputForHistory = '';

    try {
        let analysis;
        if (mode === 'text') {
            const newsContent = formData.get('newsContent') as string;
            inputForHistory = newsContent;
            if (!newsContent.trim()) {
                toast({ title: "Error", description: "Text content cannot be empty.", variant: "destructive" });
                return;
            }
            analysis = await analyzeNewsForFraud({ newsContent });
        } else if (mode === 'link') {
            const url = formData.get('link') as string;
            inputForHistory = url;
            if (!url.trim()) {
                toast({ title: "Error", description: "URL cannot be empty.", variant: "destructive" });
                return;
            }
            const summarizedData = await summarizeLinkContent({ url });
            const newsContent = summarizedData.summary;
            if (!newsContent) {
                toast({ title: "Error", description: "Could not fetch content from the provided URL.", variant: "destructive" });
                return;
            }
            analysis = await analyzeNewsForFraud({ newsContent });
        } else if (mode === 'file') {
            const file = (formData.get('file') as File);
            if (!file || file.size === 0) {
                 toast({ title: "Error", description: "Please select a file to analyze.", variant: "destructive" });
                 return;
            }
            inputForHistory = file.name;
            const fileDataUri = await fileToDataURI(file);
            analysis = await analyzeFileForFraud({ fileDataUri });
        } else if (mode === 'video') {
             const videoFile = (formData.get('video') as File);
            if (!videoFile || videoFile.size === 0) {
                 toast({ title: "Error", description: "Please select a video to analyze.", variant: "destructive" });
                 return;
            }
            inputForHistory = videoFile.name;
            const videoDataUri = await fileToDataURI(videoFile);
            analysis = await analyzeVideoForFraud({ videoDataUri });
        }

        if (analysis) {
            setResult(analysis);
            if (firestore) {
                const historyCollection = collection(firestore, `users/${user.uid}/fraudDetectionHistory`);
                addDocumentNonBlocking(historyCollection, {
                    inputType: mode,
                    inputContent: inputForHistory,
                    fraudPercentage: analysis.fraudPercentage,
                    explanation: analysis.explanation,
                    verdict: analysis.verdict,
                    analysisTimestamp: serverTimestamp(),
                    userId: user.uid,
                });
            }
        }

    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getVerdictBadgeVariant = (verdict: AnalysisResult['verdict'] | undefined) => {
    switch (verdict) {
      case 'Fraudulent':
        return 'destructive';
      case 'Real':
        return 'default';
      case 'Unsure':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-headline font-bold">Fraud Detection</h1>
        <p className="text-muted-foreground">
          Analyze articles, links, and files for potential misinformation.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Analysis Tool</CardTitle>
            <CardDescription>
              Select an input method and provide the content to be analyzed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalysis}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="text">Text</TabsTrigger>
                    <TabsTrigger value="link">Link</TabsTrigger>
                    <TabsTrigger value="file">File</TabsTrigger>
                    <TabsTrigger value="video">Video</TabsTrigger>
                  </TabsList>
                  <TabsContent value="text" className="mt-6">
                      <Label htmlFor="newsContent">Paste News Content</Label>
                      <Textarea
                        id="newsContent"
                        name="newsContent"
                        placeholder="Enter the news article text here..."
                        className="min-h-[200px]"
                        disabled={isLoading}
                      />
                  </TabsContent>
                  <TabsContent value="link" className="mt-6">
                    <Label htmlFor="link">Enter URL</Label>
                    <Input
                        id="link"
                        name="link"
                        placeholder="https://example.com/news-article"
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
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 mt-4" disabled={isLoading || !user}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Analyze
                  </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Analysis Result</CardTitle>
            <CardDescription>
              The likelihood of fraud and explanation will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
            {isLoading && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing...</p>
              </div>
            )}
            {result && !isLoading && (
              <div className="w-full space-y-6 text-center">
                <div className="space-y-2">
                  <p className="text-lg font-medium">Verdict</p>
                  <Badge variant={getVerdictBadgeVariant(result.verdict)} className="text-lg px-4 py-1">{result.verdict}</Badge>
                </div>
                <div>
                  <p className="text-lg font-medium">Likelihood of Fraud</p>
                  <p className="text-6xl font-bold text-primary">
                    {result.fraudPercentage}%
                  </p>
                </div>
                <Progress value={result.fraudPercentage} className="h-4" />
                <div>
                  <p className="text-left font-medium mb-2">Explanation:</p>
                  <div className="p-4 bg-secondary rounded-md text-left text-sm text-secondary-foreground max-h-48 overflow-y-auto">
                    {result.explanation}
                  </div>
                </div>
              </div>
            )}
            {!result && !isLoading && (
              <div className="text-center text-muted-foreground">
                <p>Results will be displayed here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
