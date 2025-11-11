
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
import { Heart, MessageCircle, Send, User } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { useState, useEffect } from 'react';
import type { CommunityPost, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, getDoc, doc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

function PostCard({ post }: { post: CommunityPost }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  
  // TODO: Check if user has already liked this post from a `likes` subcollection.
  // For now, we'll keep it simple.

  const handleLike = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You must be logged in to like posts.", variant: "destructive" });
      return;
    }

    const postRef = doc(firestore, 'community_posts', post.id);
    
    try {
      await runTransaction(firestore, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
          throw "Document does not exist!";
        }
        
        const newLikeCount = postDoc.data().likeCount + (isLiked ? -1 : 1);
        transaction.update(postRef, { likeCount: newLikeCount });
        
        setIsLiked(!isLiked);
        setLikeCount(newLikeCount);
      });
    } catch (error) {
        console.error("Like transaction failed: ", error);
        toast({ title: "Error", description: "Could not update like count.", variant: "destructive" });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={post.author?.avatarUrl} alt={post.author?.name} />
          <AvatarFallback><User /></AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{post.author?.name || 'Anonymous'}</p>
          <p className="text-sm text-muted-foreground">{post.timestamp ? formatDistanceToNow(post.timestamp.toDate(), { addSuffix: true }) : 'Just now'}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
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
            {post.commentCount} Comments
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function PostSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5 mb-4" />
        <Skeleton className="aspect-video w-full rounded-lg" />
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  )
}


export default function CommunityPage() {
  const { t } = useLanguage();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  
  const postsCollectionRef = useMemoFirebase(() => collection(firestore, 'community_posts'), [firestore]);
  const postsQuery = useMemoFirebase(() => query(postsCollectionRef, orderBy('timestamp', 'desc')), [postsCollectionRef]);
  const { data: postsData, isLoading: postsLoading } = useCollection<Omit<CommunityPost, 'id'>>(postsQuery);
  const [postsWithAuthors, setPostsWithAuthors] = useState<CommunityPost[]>([]);

  useEffect(() => {
    if (!postsData) return;

    const fetchAuthors = async () => {
      const postsWithAuthors = await Promise.all(
        postsData.map(async (post) => {
          const authorDoc = await getDoc(doc(firestore, 'users', post.userId));
          const author = authorDoc.exists() ? (authorDoc.data() as UserProfile) : null;
          return { ...post, author };
        })
      );
      setPostsWithAuthors(postsWithAuthors);
    };

    fetchAuthors();
  }, [postsData, firestore]);

  const handleCreatePost = () => {
    if (!user) {
      toast({ title: t('login_to_post'), description: t('login_to_post_description'), variant: 'destructive' });
      return;
    }
    if (!postContent.trim()) {
      toast({ title: t('cannot_post_empty'), variant: 'destructive' });
      return;
    }

    setIsPosting(true);
    addDocumentNonBlocking(postsCollectionRef, {
        userId: user.uid,
        content: postContent,
        timestamp: serverTimestamp(),
        likeCount: 0,
        commentCount: 0,
    }).then(() => {
        setPostContent('');
        toast({ title: t('post_created') });
    }).catch(err => {
        console.error(err);
        toast({ title: t('error_creating_post'), variant: 'destructive' });
    }).finally(() => {
        setIsPosting(false);
    })
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold font-headline">{t('community_feed')}</h1>
        
        {user && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">{t('create_a_post')}</h2>
            </CardHeader>
            <CardContent>
              <div className="grid w-full gap-2">
                <Textarea 
                  placeholder={t('whats_on_your_mind')} 
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  disabled={isPosting}
                />
                <Button onClick={handleCreatePost} disabled={isPosting}>
                  {isPosting ? <Skeleton className="h-4 w-8" /> : <Send className="mr-2 h-4 w-4" />}
                  {t('post')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {postsLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : (
            postsWithAuthors.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
