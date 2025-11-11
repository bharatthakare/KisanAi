'use client';

import { useState, useRef, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Send, CornerDownLeft, Mic, Bot } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { useWeather } from '@/hooks/use-weather';
import { useLanguage } from '@/contexts/language-context';
import { assistantSpeaksAdvice } from '@/ai/flows/assistant-speaks-advice';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  audioData?: string;
};

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { weather, loading: weatherLoading, error: weatherError } = useWeather();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (weatherError) {
        throw new Error('Could not fetch weather data. Please try again.');
      }
      
      const weatherString = weather ? 
        `Temp: ${weather.temperature}°C, Condition: ${weather.condition}, Humidity: ${weather.humidity}%, Wind: ${weather.windSpeed}km/h`
        : 'Weather data not available.';

      const response = await assistantSpeaksAdvice({
        query: input,
        weather: weatherString,
        language,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.advice,
        audioData: response.audio,
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error with AI Assistant:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, I am having trouble connecting. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
          title: "AI Assistant Error",
          description: error instanceof Error ? error.message : "An unknown error occurred.",
          variant: "destructive"
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <header className="p-4 border-b bg-background">
        <h1 className="text-xl font-headline font-semibold flex items-center gap-2">
            <Bot className="text-primary"/>
            {t('ai_farming_assistant')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('ask_me_anything')}</p>
      </header>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} {...message} />
          ))}
          {isLoading && <ChatMessage key="loading" role="assistant" text="" isLoading={true} />}
        </div>
      </ScrollArea>
      <div className="p-4 bg-background border-t">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-2">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
                placeholder={t('ask_about_crops')}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground text-center mt-2">
            {t('assistant_can_mistake')}
        </p>
      </div>
    </div>
  );
}
