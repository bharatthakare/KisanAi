'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, Volume2, Bot, X } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useWeather } from '@/hooks/use-weather';
import { voiceAssistant } from '@/ai/flows/voice-assistant-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Status = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export function VoiceAssistant({ open, onOpenChange }: VoiceAssistantProps) {
  const { t, language } = useLanguage();
  const { weather, error: weatherError } = useWeather();
  const { toast } = useToast();

  const [status, setStatus] = useState<Status>('idle');
  const [transcribedText, setTranscribedText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiAudio, setAiAudio] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  
  const resetState = useCallback(() => {
      stopListening();
      if(audioRef.current){
        audioRef.current.pause();
        audioRef.current = null;
      }
      setStatus('idle');
      setTranscribedText('');
      setAiResponse('');
      setAiAudio(null);
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }
    
    // Request microphone permission when dialog opens
    navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => {
        console.error("Mic permission denied:", err);
        toast({ title: "Microphone Access Denied", description: "Please allow microphone access to use the voice assistant.", variant: "destructive"});
        onOpenChange(false);
    });

  }, [open, resetState, onOpenChange, toast]);

  const handleMicClick = () => {
    if (status === 'listening') {
      stopListening();
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Browser Not Supported", description: "Your browser does not support voice recognition.", variant: "destructive" });
      return;
    }

    resetState();
    
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => setStatus('listening');
    recognition.onend = () => setStatus('idle');

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setTranscribedText(transcript);
      if (event.results[0].isFinal) {
        processTranscript(transcript);
      }
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setStatus('error');
      setAiResponse("Sorry, I had trouble understanding. Please try again.");
    };

    recognition.start();
  };
  
  const processTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;
    setStatus('processing');
    
    try {
      if (weatherError) throw new Error('Could not fetch weather data.');

      const weatherString = weather
        ? `Temp: ${weather.temperature}°C, Condition: ${weather.condition}`
        : 'Weather data not available.';

      const response = await voiceAssistant({ query: transcript, weather: weatherString, language });
      setAiResponse(response.advice);
      setAiAudio(response.audio);
      setStatus('speaking');
    } catch (error) {
      console.error("AI Error:", error);
      setStatus('error');
      setAiResponse("Sorry, something went wrong. Please try again.");
    }
  }

  useEffect(() => {
    if (status === 'speaking' && aiAudio) {
      const audio = new Audio(aiAudio);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => setStatus('idle');
    }
  }, [status, aiAudio]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="text-primary" /> {t('voice_assistant_title')}
          </DialogTitle>
          <DialogDescription>
            {t('ask_a_question')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
            <Button
              size="icon"
              className={cn(
                "h-24 w-24 rounded-full transition-all duration-300",
                status === 'listening' && "bg-red-500 hover:bg-red-600 scale-110 ring-4 ring-red-500/50",
                status === 'processing' && "bg-blue-500"
              )}
              onClick={handleMicClick}
              disabled={status === 'processing'}
            >
              {status === 'processing' ? (
                <Loader2 className="h-10 w-10 animate-spin" />
              ) : (
                <Mic className="h-10 w-10" />
              )}
            </Button>
            <div className="text-center h-20">
                {status === 'listening' && <p className="text-primary animate-pulse">{t('listening')}</p>}
                {status === 'processing' && <p className="text-blue-500">{t('processing')}</p>}
                {transcribedText && <p className="text-muted-foreground">You said: "{transcribedText}"</p>}
                
                {aiResponse && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg text-center">
                        <p className="font-semibold">{aiResponse}</p>
                        {aiAudio && (
                            <Button variant="ghost" size="sm" onClick={() => audioRef.current?.play()} className="mt-2">
                                <Volume2 className="w-4 h-4 mr-2" />
                                Listen Again
                            </Button>
                        )}
                    </div>
                )}
                 {status === 'error' && <p className="text-red-500">{aiResponse}</p>}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
