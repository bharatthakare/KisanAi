
'use client';

import { communityPosts } from '@/lib/placeholder-data';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Heart, MessageCircle, Send, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Comment } from '@/lib/types';
import { useState, useMemo } from 'react';
import { placeholderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/contexts/language-context';

function CommentCard({ comment }: { comment: Comment }) {
  const [showReply, setShowReply] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="flex gap-4">
      <Avatar className="h-8 w-8 border">
        <AvatarImage src={comment.authorAvatar} alt={comment.author} />
        <AvatarFallback><User/></AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="font-semibold">{comment.author}</p>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span>{comment.timestamp}</span>
          <button className="font-semibold" onClick={() => setShowReply(!showReply)}>{t('reply')}</button>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 pl-8 border-l-2">
            {comment.replies.map(reply => <CommentCard key={reply.id} comment={reply} />)}
          </div>
        )}

        {showReply && (
          <Card className="mt-2">
            <CardContent className="p-2">
              <div className="flex gap-2">
                <Textarea placeholder={`${t('reply_to')} ${comment.author}...`} className="text-sm" />
                <Button size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function PostPage() {
  const params = useParams();
  const postId = params.id;
  const post = useMemo(() => communityPosts.find((p) => p.id === postId), [postId]);
  const { t } = useLanguage();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes ?? 0);
  const [commentCount, setCommentCount] = useState(post?.comments.length ?? 0);


  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };


  if (!post) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">{t('post_not_found')}</h1>
        <Button asChild variant="link">
          <Link href="/community">{t('back_to_community')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/community" className='flex items-center gap-2'>
              <ArrowLeft className="h-4 w-4" />
              {t('back_to_community')}
            </Link>
          </Button>
      </div>
      <Card key={post.id} className="overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={post.authorAvatar} alt={post.author} />
            <AvatarFallback><User/></AvatarFallback>
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
              fill={isLiked ? "currentColor" : "none"}
            />
            {likeCount} {t('likes')}
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <MessageCircle className="h-4 w-4 text-blue-500" />
             {commentCount} {t('comments')}
          </div>
        </CardFooter>
      </Card>
      
      {/* Comments Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">{t('comments')}</h2>
        <div className='space-y-6'>
            {/* Add new comment */}
            <Card>
                <CardHeader>
                    <h3 className='font-semibold'>{t('leave_a_comment')}</h3>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <Avatar className="h-8 w-8 border">
                            <AvatarImage src={placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl} />
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 grid w-full gap-2">
                            <Textarea placeholder={t('write_your_comment')} />
                            <Button className='justify-self-end'>
                                <Send className="mr-2 h-4 w-4" />
                                {t('comment')}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Existing Comments */}
            {post.comments.map(comment => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
        </div>
      </div>
    </div>
  );
}
