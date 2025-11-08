'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryPage() {
  const { firestore, user } = useFirebase();

  const fraudHistoryQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, `users/${user.uid}/fraudDetectionHistory`),
        orderBy('analysisTimestamp', 'desc')
    );
  }, [firestore, user]);

  const summaryHistoryQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, `users/${user.uid}/aiSummaryHistory`),
        orderBy('summaryTimestamp', 'desc')
    );
  }, [firestore, user]);

  const { data: fraudHistory, isLoading: fraudLoading } = useCollection(fraudHistoryQuery);
  const { data: summaryHistory, isLoading: summaryLoading } = useCollection(summaryHistoryQuery);

  const getVerdictBadgeVariant = (verdict: string | undefined) => {
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
  };

  const renderTimestamp = (timestamp: any) => {
    if (!timestamp?.toDate) return 'Just now';
    return `${formatDistanceToNow(timestamp.toDate())} ago`;
  };

  const renderFraudHistory = () => {
    if (fraudLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
         <Card key={i}><CardHeader><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
      ));
    }
    if (!fraudHistory || fraudHistory.length === 0) {
      return <p>No fraud detection history found.</p>;
    }
    return (
      <Accordion type="single" collapsible className="w-full space-y-4">
        {fraudHistory.map(item => (
          <AccordionItem value={item.id} key={item.id} className="border-b-0">
             <Card>
                <AccordionTrigger className="p-6 text-left hover:no-underline">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <Badge variant={getVerdictBadgeVariant(item.verdict)} className="text-md px-3 py-1">{item.verdict}</Badge>
                         <p className="truncate text-sm font-normal text-muted-foreground">{item.inputContent}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{renderTimestamp(item.analysisTimestamp)}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-sm">Explanation</p>
                      <p className="text-muted-foreground text-sm">{item.explanation}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Fraud Likelihood</p>
                      <p className="text-muted-foreground text-sm">{item.fraudPercentage}%</p>
                    </div>
                  </div>
                </AccordionContent>
             </Card>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };
  
   const renderSummaryHistory = () => {
    if (summaryLoading) {
       return Array.from({ length: 3 }).map((_, i) => (
         <Card key={i}><CardHeader><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
      ));
    }
    if (!summaryHistory || summaryHistory.length === 0) {
      return <p>No summarization history found.</p>;
    }
    return (
      <Accordion type="single" collapsible className="w-full space-y-4">
        {summaryHistory.map(item => (
          <AccordionItem value={item.id} key={item.id} className="border-b-0">
             <Card>
                <AccordionTrigger className="p-6 text-left hover:no-underline">
                  <div className="flex-1">
                    <p className="font-medium truncate">{item.summarizedContent}</p>
                    <p className="text-xs text-muted-foreground mt-2">{renderTimestamp(item.summaryTimestamp)} &bull; {item.outputLanguage}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                   <div>
                      <p className="font-semibold text-sm">Original Input</p>
                      <p className="text-muted-foreground text-sm line-clamp-3">{item.inputContent}</p>
                    </div>
                </AccordionContent>
             </Card>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };


  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-headline font-bold">History</h1>
        <p className="text-muted-foreground">
          Review your past fraud detection analyses and generated summaries.
        </p>
      </header>

      {!user ? (
        <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
                <p>Please log in to view your history.</p>
            </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="fraud-detection">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fraud-detection">Fraud Detection</TabsTrigger>
            <TabsTrigger value="summarization">Summarization</TabsTrigger>
          </TabsList>
          <TabsContent value="fraud-detection" className="mt-6">
            {renderFraudHistory()}
          </TabsContent>
          <TabsContent value="summarization" className="mt-6">
            {renderSummaryHistory()}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
