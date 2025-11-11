
'use client';

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
import type { Comment, CommunityPost, UserProfile } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { useDoc, useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp, runTransaction, getDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';


function CommentCard({ comment }: { comment: Comment }) {
  const [showReply, setShowReply] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="flex gap-4">
      <Avatar className="h-8 w-8 border">
        <AvatarImage src={comment.author?.avatarUrl} alt={comment.author?.name} />
        <AvatarFallback><User/></AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="font-semibold">{comment.author?.name || 'Anonymous'}</p>
          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span>{comment.timestamp ? formatDistanceToNow(comment.timestamp.toDate(), { addSuffix: true }) : 'Just now'}</span>
          {/* Reply functionality to be implemented */}
          {/* <button className="font-semibold" onClick={() => setShowReply(!showReply)}>{t('reply')}</button> */}
        </div>

        {/* Reply rendering to be implemented */}
      </div>
    </div>
  )
}

export default function PostPage() {
  const params = useParams();
  const postId = params.id as string;
  const { t } = useLanguage();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isLiked, setIsLiked] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  
  const [postWithAuthor, setPostWithAuthor] = useState<CommunityPost | null>(null);
  const [commentsWithAuthors, setCommentsWithAuthors] = useState<Comment[]>([]);

  // Post data
  const postDocRef = useMemoFirebase(() => doc(firestore, 'community_posts', postId), [firestore, postId]);
  const { data: postData, isLoading: isPostLoading } = useDoc<Omit<CommunityPost, 'id'>>(postDocRef);

  // Comments data
  const commentsColRef = useMemoFirebase(() => collection(firestore, 'community_posts', postId, 'comments'), [firestore, postId]);
  const commentsQuery = useMemoFirebase(() => query(commentsColRef, orderBy('timestamp', 'asc')), [commentsColRef]);
  const { data: commentsData, isLoading: areCommentsLoading } = useCollection<Omit<Comment, 'id'>>(commentsQuery);
  
  // Fetch post author
  useEffect(() => {
    if(!postData) return;
    getDoc(doc(firestore, 'users', postData.userId)).then(authorDoc => {
      const author = authorDoc.exists() ? (authorDoc.data() as UserProfile) : null;
      setPostWithAuthor({ ...postData, author });
    });
  }, [postData, firestore]);

  // Fetch comment authors
  useEffect(() => {
    if (!commentsData) return;

    const fetchAuthors = async () => {
      const commentsWithAuthors = await Promise.all(
        commentsData.map(async (comment) => {
          const authorDoc = await getDoc(doc(firestore, 'users', comment.userId));
          const author = authorDoc.exists() ? (authorDoc.data() as UserProfile) : null;
          return { ...comment, author };
        })
      );
      setCommentsWithAuthors(commentsWithAuthors);
    };

    fetchAuthors();
  }, [commentsData, firestore]);


  const handleLike = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You must be logged in to like posts.", variant: "destructive" });
      return;
    }

    try {
      await runTransaction(firestore, async (transaction) => {
        const postDoc = await transaction.get(postDocRef);
        if (!postDoc.exists()) {
          throw "Document does not exist!";
        }
        
        const newLikeCount = postDoc.data().likeCount + (isLiked ? -1 : 1);
        transaction.update(postDocRef, { likeCount: newLikeCount });
        
        setIsLiked(!isLiked);
      });
    } catch (error) {
        console.error("Like transaction failed: ", error);
        toast({ title: "Error", description: "Could not update like count.", variant: "destructive" });
    }
  };

  const handleComment = () => {
    if (!user) {
      toast({ title: t('login_to_comment'), description: t('login_to_comment_desc'), variant: 'destructive' });
      return;
    }
    if(!commentContent.trim()) {
      toast({ title: t('cannot_post_empty_comment'), variant: 'destructive'});
      return;
    }
    setIsPostingComment(true);

    const postRef = doc(firestore, 'community_posts', postId);

    runTransaction(firestore, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
            throw "Post does not exist!";
        }
        
        const newCommentCount = (postDoc.data().commentCount || 0) + 1;
        transaction.update(postRef, { commentCount: newCommentCount });

        const newCommentRef = doc(commentsColRef);
        transaction.set(newCommentRef, {
            userId: user.uid,
            content: commentContent,
            timestamp: serverTimestamp()
        });

    }).then(() => {
        setCommentContent('');
        toast({ title: t('comment_posted') });
    }).catch(err => {
        console.error(err);
        toast({ title: t('error_posting_comment'), variant: 'destructive' });
    }).finally(() => {
        setIsPostingComment(false);
    })
  }

  if (isPostLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="w-full h-[600px]" />
      </div>
    )
  }

  if (!postWithAuthor) {
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
      <Card key={postWithAuthor.id} className="overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={postWithAuthor.author?.avatarUrl} alt={postWithAuthor.author?.name} />
            <AvatarFallback><User/></AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{postWithAuthor.author?.name || 'Anonymous'}</p>
            <p className="text-sm text-muted-foreground">
                {postWithAuthor.timestamp ? formatDistanceToNow(postWithAuthor.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 whitespace-pre-wrap">{postWithAuthor.content}</p>
          {postWithAuthor.imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={postWithAuthor.imageUrl}
                alt="Post image"
                fill
                className="object-cover"
                data-ai-hint={postWithAuthor.imageHint}
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
            {postWithAuthor.likeCount} {t('likes')}
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <MessageCircle className="h-4 w-4 text-blue-500" />
             {postWithAuthor.commentCount} {t('comments')}
          </div>
        </CardFooter>
      </Card>
      
      {/* Comments Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">{t('comments')}</h2>
        <div className='space-y-6'>
            {user && (
              <Card>
                  <CardHeader>
                      <h3 className='font-semibold'>{t('leave_a_comment')}</h3>
                  </CardHeader>
                  <CardContent>
                      <div className="flex items-start gap-4">
                          <Avatar className="h-8 w-8 border">
                              <AvatarImage src={user.photoURL || undefined} />
                              <AvatarFallback><User /></AvatarFallback>
                          </Avatar>
                          <div className="flex-1 grid w-full gap-2">
                              <Textarea 
                                placeholder={t('write_your_comment')} 
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                disabled={isPostingComment}
                              />
                              <Button className='justify-self-end' onClick={handleComment} disabled={isPostingComment}>
                                  {isPostingComment ? <Skeleton className='h-4 w-8' /> : <Send className="mr-2 h-4 w-4" />}
                                  {t('comment')}
                              </Button>
                          </div>
                      </div>
                  </CardContent>
              </Card>
            )}

            {/* Existing Comments */}
            {areCommentsLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
                commentsWithAuthors.length > 0 ? (
                    commentsWithAuthors.map(comment => (
                      <CommentCard key={comment.id} comment={comment} />
                    ))
                ) : (
                    <p className='text-muted-foreground text-center'>{t('no_comments_yet')}</p>
                )
            )}
        </div>
      </div>
    </div>
  );
}
