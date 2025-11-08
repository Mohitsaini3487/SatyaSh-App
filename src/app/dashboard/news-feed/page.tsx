'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { generateNewsArticles } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast"

type NewsArticle = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  imageHint: string;
  description: string;
  author: string;
  date: string;
};

export default function NewsFeedPage() {
    const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            const response = await generateNewsArticles();
            setNewsItems(response.articles);
        } catch (error) {
            console.error('Failed to fetch news articles:', error);
            toast({
                title: "Error",
                description: "Could not fetch the latest news. Please try again.",
                variant: "destructive",
            });
            setNewsItems([]); // Clear items on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);


  return (
    <div className="p-4 md:p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-headline font-bold">News Feed</h1>
            <p className="text-muted-foreground">
            Curated educational content on misinformation, updated in real-time.
            </p>
        </div>
        <Button onClick={fetchNews} disabled={isLoading} variant="outline" size="icon">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh News</span>
        </Button>
      </header>
        
        {isLoading && (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="flex flex-col overflow-hidden">
                        <Skeleton className="h-48 w-full" />
                        <CardHeader>
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-6 w-full mt-2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-full mt-2" />
                             <Skeleton className="h-4 w-3/4 mt-2" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-4 w-1/2" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}

        {!isLoading && newsItems.length > 0 && (
             <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {newsItems.map((item) => (
                <Card key={item.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative h-48 w-full">
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        data-ai-hint={item.imageHint}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    </div>
                    <CardHeader>
                    <Badge variant="secondary" className="w-fit">{item.category}</Badge>
                    <CardTitle className="mt-2 text-lg font-headline">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                    <CardDescription>{item.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground">
                    <p>By {item.author} &bull; {item.date}</p>
                    </CardFooter>
                </Card>
                ))}
            </div>
        )}
        
        {!isLoading && newsItems.length === 0 && (
             <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>Could not load news feed. Click the refresh button to try again.</p>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
