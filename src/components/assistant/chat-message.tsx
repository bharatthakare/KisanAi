'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bot, User, Volume2, Loader2 } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';

type ChatMessageProps = {
  role: 'user' | 'assistant';
  text: string;
  audioData?: string;
  isLoading?: boolean;
};

export function ChatMessage({ role, text, audioData, isLoading }: ChatMessageProps) {
  const userAvatar = placeholderImages.find(p => p.id === 'user-avatar-1');
  
  const playAudio = () => {
    if (audioData) {
      const audio = new Audio(audioData);
      audio.play();
    }
  };

  return (
    <div className={cn('flex items-start gap-4', role === 'user' ? 'justify-end' : '')}>
      {role === 'assistant' && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback className="bg-primary/20">
            <Bot className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-lg p-3 text-sm shadow-sm',
          role === 'user' ? 'bg-primary/80 text-primary-foreground' : 'bg-card'
        )}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert break-words whitespace-pre-wrap">
            {text}
          </div>
        )}
        {audioData && !isLoading && (
          <Button onClick={playAudio} variant="ghost" size="sm" className="mt-2 -ml-2">
            <Volume2 className="h-4 w-4 mr-2" />
            Listen
          </Button>
        )}
      </div>
      {role === 'user' && (
        <Avatar className="h-8 w-8 border">
          {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User" />}
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
