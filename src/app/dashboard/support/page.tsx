'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bug, MessageSquareHeart } from 'lucide-react';
import { useState } from 'react';

export default function SupportPage() {
  const { toast } = useToast();
  const [bugDescription, setBugDescription] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const whatsappNumber = '917494889287'; // Country code + number

  const handleBugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugDescription.trim()) {
        toast({
            title: 'Error',
            description: 'Please describe the bug before submitting.',
            variant: 'destructive'
        });
        return;
    }
    
    const formattedMessage = `*SatyaShodh Bug Report*\n\n${bugDescription}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`;
    
    window.open(whatsappUrl, '_blank');

    toast({
      title: 'Bug Report Ready',
      description: "Please send the pre-filled message in WhatsApp to report your bug.",
    });
    setBugDescription('');
  };
  
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) {
        toast({
            title: 'Error',
            description: 'Please enter your feedback before submitting.',
            variant: 'destructive'
        });
        return;
    }
    
    const formattedMessage = `*SatyaShodh Feedback*\n\n${feedbackMessage}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`;

    window.open(whatsappUrl, '_blank');

    toast({
      title: 'Feedback Ready',
      description: "Please send the pre-filled message in WhatsApp.",
    });
    setFeedbackMessage('');
  };


  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-headline font-bold">Support Center</h1>
        <p className="text-muted-foreground">
          Report issues or share your feedback to help us improve.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bug className="h-6 w-6 text-destructive" />
              <CardTitle className="font-headline">Report a Bug</CardTitle>
            </div>
            <CardDescription>
              Encountered an issue? Let us know so we can fix it. This will open WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBugSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bug-description">Bug Description</Label>
                <Textarea
                  id="bug-description"
                  placeholder="Please provide a detailed description of the bug, including steps to reproduce it."
                  className="min-h-[150px]"
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                />
              </div>
              <Button type="submit" variant="destructive" className="w-full">
                Submit Bug via WhatsApp
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
             <div className="flex items-center gap-3">
                <MessageSquareHeart className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline">Provide Feedback</CardTitle>
             </div>
            <CardDescription>
              Have suggestions or comments? Let us know how we can improve. This will open WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback-message">Your Feedback</Label>
                <Textarea
                  id="feedback-message"
                  placeholder="Share your thoughts on how we can improve the application."
                  className="min-h-[150px]"
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                Send Feedback via WhatsApp
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
