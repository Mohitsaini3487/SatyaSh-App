'use client';

import { useRouter } from 'next/navigation';
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
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { AnimatedBackground } from '@/components/animated-background';
import { Search, Loader2, BarChart, FileText, Bot, History } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { signInWithPopup, GoogleAuthProvider, UserCredential } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
      <AnimatedBackground />
      <div className="z-10 w-full">
        <section className="text-center py-20">
            <div className="inline-block p-3 bg-primary rounded-full mb-4">
            <Search className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary">
            SatyaSh शोधak
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered shield against misinformation. Analyze news, articles, and media with cutting-edge technology.
            </p>
             <div className="mt-8">
                <GoogleSignInButton />
             </div>
        </section>

        <section id="features" className="py-20 bg-background/50 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                 <h2 className="text-3xl font-headline font-bold text-center mb-12">Powerful Features</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard
                        icon={<BarChart className="h-10 w-10 text-accent"/>}
                        title="Real-time Analysis"
                        description="Instantly analyze text, links, files, and videos for fraudulent content."
                    />
                     <FeatureCard
                        icon={<FileText className="h-10 w-10 text-accent"/>}
                        title="AI Summarizer"
                        description="Get concise, multilingual summaries of lengthy articles and documents."
                    />
                     <FeatureCard
                        icon={<History className="h-10 w-10 text-accent"/>}
                        title="Comprehensive History"
                        description="Keep a detailed record of all your past analyses and summaries."
                    />
                     <FeatureCard
                        icon={<Bot className="h-10 w-10 text-accent"/>}
                        title="Multilingual Chatbot"
                        description="Get support in the top 10 Indian languages for a seamless experience."
                    />
                 </div>
            </div>
        </section>
        
        <section id="faq" className="py-20">
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

        <footer className="w-full py-6 text-center text-sm text-muted-foreground border-t border-border/20">
            <p>&copy; {new Date().getFullYear()} SatyaSh शोधak. All rights reserved.</p>
            <p className="mt-2 font-medium">Mohit Saini - Machine Learning Analyst, Full Stack Developer</p>
        </footer>
      </div>
    </main>
  );
}

function GoogleSignInButton() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      if (!auth || !firestore) {
        throw new Error('Firebase services are not available.');
      }
      
      const userCredential: UserCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user exists in Firestore, if not create a new document
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            username: user.displayName,
            photoURL: user.photoURL,
            mobileNumber: user.phoneNumber || '',
            socialLinks: [],
            preferences: '',
            createdAt: serverTimestamp()
        }, { merge: true });
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Google Sign-In failed:", error);
      toast({
        title: "Sign-In Failed",
        description: error.message || "An unexpected error occurred during sign-in.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleGoogleSignIn} className="bg-accent hover:bg-accent/90" size="lg" disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 102.3 279.2 88 248 88c-73.2 0-132.3 59.2-132.3 132.3s59.1 132.3 132.3 132.3c76.9 0 111.2-51.8 115.8-77.9H248v-61h239.5c5.3 22.8 8.5 46.4 8.5 72.9z"></path>
        </svg>
      )}
      Sign in with Google to Get Started
    </Button>
  );
}

function FeatureCard({icon, title, description} : {icon: React.ReactNode, title: string, description: string}) {
    return (
        <Card className="text-center bg-transparent border-border/50 shadow-lg hover:shadow-primary/20 hover:-translate-y-2 transition-transform duration-300">
            <CardHeader className="items-center">
                <div className="p-4 bg-accent/10 rounded-full">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <CardTitle className="font-headline text-xl mb-2">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardContent>
        </Card>
    )
}

function FAQItem({value, question, answer}: {value: string, question: string, answer: string}) {
    return (
        <AccordionItem value={value} className="bg-background/50 backdrop-blur-sm rounded-lg mb-2 border px-4">
            <AccordionTrigger className="text-left font-semibold hover:no-underline">{question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                {answer}
            </AccordionContent>
        </AccordionItem>
    )
}
