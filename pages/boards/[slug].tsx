import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2, MessageCircle, MessagesSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { getBoardWithThreads } from '../../lib/queries';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';

const THREAD_LIMIT = 100;

type ThreadSummary = {
  id: string;
  title: string;
  lastBumpedAt: string;
  replies: number;
};

type Props = {
  board: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
  };
  threads: ThreadSummary[];
};

export default function BoardPage({ board, threads }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [name, setName] = useState('Anonymous');
  const [email, setEmail] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Title and body are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/thread/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: board.id,
          title,
          body,
          name,
          email: email || null,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to create thread.');
      }

      await router.push(`/threads/${payload.threadId}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to create thread.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="space-y-10">
      <Head>
        <title>{board.title} | Anonymous BBS</title>
      </Head>

      <motion.section className="space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ChevronLeft className="h-4 w-4" /> Back to boards
        </Link>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">{board.title}</h1>
          {board.description ? <p className="text-sm text-muted-foreground">{board.description}</p> : null}
        </div>
      </motion.section>

      <motion.section
        className="grid gap-6 lg:grid-cols-[minmax(0,560px)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="border-border/60 bg-secondary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessagesSquare className="h-5 w-5 text-primary" />
              Create a new thread
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Enter <code>sage</code> in the mail field to skip bumping. Tripcodes follow the <code>Name#key</code> format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  rows={6}
                  maxLength={4000}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={64} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Mail (sage to stay down)</Label>
                  <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={128} />
                </div>
              </div>
              {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Start thread
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section className="space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent threads</h2>
          <Badge variant="outline" className="text-muted-foreground">
            Showing up to {THREAD_LIMIT}
          </Badge>
        </header>
        <div className="grid gap-4">
          {threads.map((thread) => (
            <Card key={thread.id} className="border-border/60 bg-secondary/30 transition hover:border-primary/60">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-2">
                  <CardTitle className="text-lg">
                    <Link href={`/threads/${thread.id}`} className="hover:text-primary">
                      {thread.title}
                    </Link>
                  </CardTitle>
                </div>
                <Badge className="bg-primary/20 text-primary">Replies {thread.replies}</Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0 text-xs text-muted-foreground">
                <span>Last bump {new Date(thread.lastBumpedAt).toLocaleString()}</span>
                <Link href={`/threads/${thread.id}`} className="inline-flex items-center gap-1 text-primary">
                  Open thread
                  <MessageCircle className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
          {threads.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No threads yet.
              </CardContent>
            </Card>
          ) : null}
        </div>
      </motion.section>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const slug = typeof params?.slug === 'string' ? params.slug : null;
  if (!slug) {
    return { notFound: true };
  }

  const result = await getBoardWithThreads(slug);

  if (!result) {
    return { notFound: true };
  }

  return {
    props: {
      board: result.board,
      threads: result.threads.map((thread) => ({
        id: thread.id,
        title: thread.title,
        lastBumpedAt: thread.lastBumpedAt.toISOString(),
        replies: thread.replies,
      })),
    },
  };
};
