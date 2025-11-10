
'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { communityPosts } from '@/lib/placeholder-data';
import { Heart, MessageCircle, Send, User } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { useState } from 'react';
import type { CommunityPost } from '@/lib/types';

function PostCard({ post }: { post: CommunityPost }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={post.authorAvatar} alt={post.author} />
          <AvatarFallback><User /></AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{post.author}</p>
          <p className="text-sm text-muted-foreground">{post.timestamp}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{post.content}</p>
        {post.imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={post.imageUrl}
              alt="Post image"
              fill
              className="object-cover"
              data-ai-hint={post.imageHint}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={handleLike}>
          <Heart
            className="h-4 w-4 text-red-500"
            fill={isLiked ? 'currentColor' : 'none'}
          />
          {likeCount} Likes
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2" asChild>
          <Link href={`/community/${post.id}`}>
            <MessageCircle className="h-4 w-4 text-blue-500" />
            {post.comments.length} Comments
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function CommunityPage() {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold font-headline">{t('community_feed')}</h1>
        
        {/* Create Post Card */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">{t('create_a_post')}</h2>
          </CardHeader>
          <CardContent>
            <div className="grid w-full gap-2">
              <Textarea placeholder={t('whats_on_your_mind')} />
              <Button>
                <Send className="mr-2 h-4 w-4" />
                {t('post')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          {communityPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
