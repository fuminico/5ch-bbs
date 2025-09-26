import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Loader2, ChevronLeft, Hash, CornerDownRight } from 'lucide-react';
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
          <span key={lineIndex} className={isQuote ? 'block text-green-400' : undefined}>
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
  const [name, setName] = useState('名無しさん');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!body.trim()) {
      setError('本文を入力してください。');
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
        throw new Error(payload?.error ?? '返信の投稿に失敗しました。');
      }

      setBody('');
      await router.replace(router.asPath);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '返信の投稿に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="space-y-10 py-12">
      <Head>
        <title>{thread.title} | 匿名掲示板</title>
      </Head>

      <motion.section className="space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          href={`/boards/${thread.boardSlug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> {thread.boardTitle}へ戻る
        </Link>
        <h1 className="text-3xl font-semibold">{thread.title}</h1>
      </motion.section>

      <motion.section className="grid gap-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CornerDownRight className="h-5 w-5 text-primary" />
              このスレッドに返信する
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">名前 (トリップコード対応)</Label>
                  <Input id="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={64} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">メール (sageでスレ維持)</Label>
                  <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={128} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">本文</Label>
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
                  返信する
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section className="space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">投稿一覧</h2>
          <span className="text-xs text-muted-foreground">IDは24時間で変わります</span>
        </header>
        <div className="grid gap-4">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            >
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
                <CardHeader className="flex flex-col space-y-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="font-semibold text-primary">{post.no}</span>
                    <span className="font-bold text-green-400">{post.name}</span>
                    {post.trip ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Hash className="h-3.5 w-3.5" />
                        {post.trip}
                      </span>
                    ) : null}
                    {post.email ? (
                      <a href={`mailto:${post.email}`} className={`text-cyan-400 hover:underline ${post.wasSaged ? 'font-bold text-muted-foreground' : ''}`}>
                        {post.email}
                      </a>
                    ) : null}
                    <span className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString('ja-JP')}</span>
                    <Badge variant="outline" className="border-primary/40 text-xs text-primary">
                      ID:{post.dayId}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 text-sm text-foreground/90">
                  <div className="post-body space-y-3">{renderBody(post.body)}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {posts.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                まだ投稿がありません。
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