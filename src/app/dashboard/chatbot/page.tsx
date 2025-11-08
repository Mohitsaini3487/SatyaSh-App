'use client';

import { useState, useRef, useEffect } from 'react';
import { multilingualChatbot, textToSpeech } from '@/lib/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Bot, Loader2, Send, User, Mic, Square, Volume2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { Label } from '@/components/ui/label';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  audioUrl?: string;
};

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

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! How can I assist you today? Please select your language.", sender: 'bot'}
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  useEffect(() => {
    // Setup SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US'; // This can be changed dynamically

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript); // Automatically send after successful recognition
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({ title: 'Voice Error', description: 'Could not recognize speech. Please try again.', variant: 'destructive'});
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [toast]);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
      toast({title: "Browser Not Supported", description: "Your browser does not support voice recognition.", variant: "destructive"});
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const currentInput = textToSend || input;
    if (!currentInput.trim()) return;
    
    const userMessage: Message = { id: Date.now(), text: currentInput, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await multilingualChatbot({ language, query: currentInput });
      const ttsResponse = await textToSpeech(response.response);

      const botMessage: Message = { 
        id: Date.now() + 1, 
        text: response.response, 
        sender: 'bot',
        audioUrl: ttsResponse.media
      };
      setMessages(prev => [...prev, botMessage]);

      if (ttsResponse.media) {
        if (audioRef.current) {
          audioRef.current.src = ttsResponse.media;
          audioRef.current.play();
        }
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to get a response from the chatbot.",
        variant: "destructive"
      });
      const errorMessage: Message = { id: Date.now() + 1, text: "I'm sorry, I encountered an error. Please try again.", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  }

  return (
    <div className="p-4 md:p-8 flex flex-col h-[calc(100vh-theme(spacing.16))]">
      <header className="mb-4">
        <h1 className="text-3xl font-headline font-bold">AI Voice Agent</h1>
        <p className="text-muted-foreground">
          Your 24/7 multilingual voice-enabled assistant for guidance and support.
        </p>
      </header>

      <div className="flex-1 flex flex-col bg-card shadow-lg rounded-lg border">
        <div className="p-4 border-b flex items-center gap-4">
            <Label htmlFor="language" className="text-sm">Language:</Label>
            <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                    {languages.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-4',
                  message.sender === 'user' && 'justify-end'
                )}
              >
                {message.sender === 'bot' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-xs md:max-w-md lg:max-w-2xl rounded-lg px-4 py-2 text-sm shadow relative group',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {message.text}
                   {message.sender === 'bot' && message.audioUrl && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-primary/20 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => playAudio(message.audioUrl!)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                </div>
                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-4">
                    <Avatar className="h-8 w-8 border">
                        <AvatarFallback><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-2 shadow">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4 bg-background rounded-b-lg">
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Type or click the mic to talk..."
              className="pr-24"
              disabled={isLoading}
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                <Button
                    size="icon"
                    variant="ghost"
                    className={cn("h-8 w-10", isRecording ? "text-destructive" : "")}
                    onClick={handleToggleRecording}
                    disabled={isLoading}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                    {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                size="icon"
                className="h-8 w-10 bg-accent hover:bg-accent/90"
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                >
                <Send className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
