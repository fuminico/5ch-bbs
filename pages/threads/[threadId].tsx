import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Loader2, ChevronLeft, Hash, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { getThreadWithPosts } from '../../lib/queries';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export type PostView = {
  id: string;
  no: number;
  name: string;
  trip: string | null;
  email: string | null;
  body: string;
  dayId: string;
  createdAt: string;
  wasSaged: boolean;
};

type Props = {
  thread: {
    id: string;
    title: string;
    boardSlug: string;
    boardTitle: string;
  };
  posts: PostView[];
};

function renderBody(body: string) {
  return body.split(/\n{2,}/).map((paragraph, paragraphIndex) => (
    <p key={paragraphIndex} className="leading-relaxed">
      {paragraph.split('\n').map((line, lineIndex) => {
        const isQuote = /^>/.test(line.trim());
        return (
          <span key={lineIndex} className={isQuote ? 'block text-sm text-primary' : undefined}>
            {line}
            {lineIndex < paragraph.split('\n').length - 1 ? <br /> : null}
          </span>
        );
      })}
    </p>
  ));
}

export default function ThreadPage({ thread, posts }: Props) {
  const router = useRouter();
  const [name, setName] = useState('Anonymous');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!body.trim()) {
      setError('Message is required.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/post/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: thread.id,
          name,
          email: email || null,
          body,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to post reply.');
      }

      setBody('');
      await router.replace(router.asPath);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to post reply.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="space-y-10">
      <Head>
        <title>{thread.title} | Anonymous BBS</title>
      </Head>

      <motion.section className="space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          href={`/boards/${thread.boardSlug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" /> Back to {thread.boardTitle}
        </Link>
        <h1 className="text-3xl font-semibold">{thread.title}</h1>
      </motion.section>

      <motion.section className="grid gap-6 lg:grid-cols-[minmax(0,560px)]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-border/60 bg-secondary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Reply to thread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (tripcodes supported)</Label>
                  <Input id="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={64} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Mail (sage keeps position)</Label>
                  <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={128} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  rows={7}
                  maxLength={4000}
                  required
                />
              </div>
              {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Post reply
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section className="space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Replies</h2>
          <span className="text-xs text-muted-foreground">Day IDs rotate every 24h</span>
        </header>
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="border-border/60 bg-secondary/20">
              <CardHeader className="flex flex-col space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-semibold text-primary">#{post.no}</span>
                  <span className="font-medium">{post.name}</span>
                  {post.trip ? (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-200">
                      <Hash className="h-3.5 w-3.5" />#{post.trip}
                    </span>
                  ) : null}
                  <Badge variant="outline" className="border-primary/40 text-xs text-primary">
                    ID:{post.dayId}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</span>
                  {post.email ? (
                    <Badge variant="outline" className={post.wasSaged ? 'border-emerald-500/40 text-emerald-300' : ''}>
                      {post.email}
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-sm">
                <div className="post-body space-y-3">{renderBody(post.body)}</div>
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No replies yet.
              </CardContent>
            </Card>
          ) : null}
        </div>
      </motion.section>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const threadId = typeof params?.threadId === 'string' ? params.threadId : null;
  if (!threadId) {
    return { notFound: true };
  }

  const result = await getThreadWithPosts(threadId);

  if (!result) {
    return { notFound: true };
  }

  return {
    props: {
      thread: result.thread,
      posts: result.posts.map((post) => ({
        id: post.id,
        no: post.no,
        name: post.name,
        trip: post.trip,
        email: post.email,
        body: post.body,
        dayId: post.dayId,
        createdAt: post.createdAt.toISOString(),
        wasSaged: post.wasSaged,
      })),
    },
  };
};
