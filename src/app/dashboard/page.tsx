'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Activity,
  Users,
  ScanSearch,
  Languages,
  FileText,
  Bot,
  History,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { AnimatedBackground } from '@/components/animated-background';

const initialBarChartData = [
  { category: 'Politics', value: 75, fill: 'var(--color-politics)' },
  { category: 'Health', value: 25, fill: 'var(--color-health)' },
  { category: 'Technology', value: 90, fill: 'var(--color-technology)' },
  { category: 'Finance', value: 60, fill: 'var(--color-finance)' },
  { category: 'Social Media', value: 40, fill: 'var(--color-social)' },
];

const chartConfig = {
  value: {
    label: 'Accuracy',
  },
  politics: {
    label: 'Politics',
    color: 'hsl(var(--chart-1))',
  },
  health: {
    label: 'Health',
    color: 'hsl(var(--chart-2))',
  },
  technology: {
    label: 'Technology',
    color: 'hsl(var(--chart-3))',
  },
  finance: {
    label: 'Finance',
    color: 'hsl(var(--chart-4))',
  },
  social: {
    label: 'Social',
    color: 'hsl(var(--chart-5))',
  },
};

export default function DashboardPage() {
    const [barChartData, setBarChartData] = useState(initialBarChartData);

    useEffect(() => {
        const interval = setInterval(() => {
        setBarChartData(
            initialBarChartData.map(item => ({
            ...item,
            value: Math.floor(Math.random() * 70) + 20, // Random value between 20 and 90
            }))
        );
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

  return (
    <div className="relative flex flex-col min-h-screen">
       <AnimatedBackground />
      <main className="flex-1 p-4 md:p-8 space-y-8 z-10">
        <header>
          <h1 className="text-3xl font-headline font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s a real-time overview of SatyaSh शोधak.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Articles Analyzed"
            value="12,450"
            icon={<ScanSearch className="h-6 w-6 text-muted-foreground" />}
            change="+12.5% this month"
          />
          <MetricCard
            title="Fake News Detected"
            value="1,892"
            icon={<Activity className="h-6 w-6 text-muted-foreground" />}
            change="+5.2% this month"
            isWarning
          />
          <MetricCard
            title="Active Users"
            value="5,230"
            icon={<Users className="h-6 w-6 text-muted-foreground" />}
            change="+2.1% this week"
          />
          <MetricCard
            title="Languages Supported"
            value="10+"
            icon={<Languages className="h-6 w-6 text-muted-foreground" />}
            change="Hindi, Bengali, Marathi..."
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="shadow-lg lg:col-span-3 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-headline">Prediction Analysis</CardTitle>
              <CardDescription>
                Live accuracy of fake news detection across different categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <BarChart data={barChartData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} domain={[0, 100]} stroke="hsl(var(--foreground))" />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="value" radius={8}>
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                      formatter={(value: number) => `${value}%`}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureHighlightCard 
                icon={<FileText className="h-8 w-8 text-primary"/>}
                title="AI Summarizer"
                description="Get concise, multilingual summaries of lengthy articles and documents."
                imageUrl="https://picsum.photos/seed/summary/600/400"
                imageHint="abstract document"
            />
             <FeatureHighlightCard 
                icon={<History className="h-8 w-8 text-primary"/>}
                title="Comprehensive History"
                description="Keep a detailed record of all your past analyses and summaries for easy review."
                imageUrl="https://picsum.photos/seed/history/600/400"
                imageHint="archive records"
            />
             <FeatureHighlightCard 
                icon={<Bot className="h-8 w-8 text-primary"/>}
                title="Multilingual Chatbot"
                description="Get support in the top 10 Indian languages for a seamless experience."
                imageUrl="https://picsum.photos/seed/chatbot/600/400"
                imageHint="robot assistant"
            />
        </section>

         <section id="faq" className="py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-3xl font-headline font-bold text-center mb-12">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                    <FAQItem
                        value="item-1"
                        question="What is SatyaSh शोधak?"
                        answer="SatyaSh शोधak is an AI-powered application designed to help users detect fake news, analyze content for fraud, and summarize information from various sources like text, links, files, and videos."
                    />
                    <FAQItem
                        value="item-2"
                        question="How accurate is the fraud detection?"
                        answer="Our application uses advanced machine learning models and AI to provide a fraud likelihood percentage. While highly accurate, it should be used as a tool to aid your own judgment, not as an absolute final verdict."
                    />
                    <FAQItem
                        value="item-3"
                        question="What languages are supported?"
                        answer="The AI results, including summaries and chatbot responses, are available in the top 10 most spoken Indian languages, including Hindi, Bengali, Marathi, and more."
                    />
                    <FAQItem
                        value="item-4"
                        question="Is my data secure?"
                        answer="Yes, your data is secure. We use Firebase Authentication to manage user accounts, and all your analysis history is stored securely in your private Firestore database, accessible only by you."
                    />
                    <FAQItem
                        value="item-5"
                        question="Can I use this for commercial purposes?"
                        answer="Currently, SatyaSh शोधak is intended for personal and educational use to promote media literacy. For commercial licensing, please contact our support team."
                    />
                </Accordion>
            </div>
        </section>
      </main>
      <footer className="w-full py-6 text-center text-sm text-muted-foreground border-t z-10 bg-background/50 backdrop-blur-sm">
            <p>&copy; {new Date().getFullYear()} SatyaSh शोधak. All rights reserved.</p>
            <p className="mt-2 font-medium">Mohit Saini - Machine Learning Analyst, Full Stack Developer</p>
        </footer>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  change,
  isWarning = false,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  isWarning?: boolean;
}) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary">{value}</div>
        <p
          className={`text-xs ${
            isWarning ? 'text-accent' : 'text-muted-foreground'
          }`}
        >
          {change}
        </p>
      </CardContent>
    </Card>
  );
}

function FeatureHighlightCard({
    icon,
    title,
    description,
    imageUrl,
    imageHint
}: {
    icon: React.ReactNode,
    title: string,
    description: string,
    imageUrl: string,
    imageHint: string
}) {
    return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow overflow-hidden bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                    {icon}
                </div>
                <div>
                    <CardTitle className="font-headline text-xl">{title}</CardTitle>
                    <CardDescription className="mt-1">{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative aspect-video rounded-md overflow-hidden">
                    <Image 
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                        data-ai-hint={imageHint}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            </CardContent>
        </Card>
    )
}

function FAQItem({value, question, answer}: {value: string, question: string, answer: string}) {
    return (
        <AccordionItem value={value} className="bg-card/80 backdrop-blur-sm rounded-lg mb-2 border px-4">
            <AccordionTrigger className="text-left font-semibold hover:no-underline">{question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                {answer}
            </AccordionContent>
        </AccordionItem>
    )
}
