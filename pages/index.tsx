import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { listBoards, type BoardSummary } from '../lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

type BoardSummaryProps = Omit<BoardSummary, 'activityAt'> & {
  activityAt: string;
};

type Props = {
  boards: BoardSummaryProps[];
};

export default function Home({ boards }: Props) {
  return (
    <main className="space-y-10 py-12">
      <Head>
        <title>匿名掲示板</title>
      </Head>

      <motion.section
        className="space-y-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-4xl font-bold tracking-tight">匿名掲示板へようこそ</h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          ここは、自由な議論と表現のためのスペースです。気になる掲示板に参加して、あなたの声を届けましょう。
        </p>
      </motion.section>

      <motion.section
        className="space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.05 }}
      >
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">掲示板一覧</h2>
            <p className="text-sm text-muted-foreground">
              活発に議論されている掲示板をチェックしよう。
            </p>
          </div>
        </header>

        <div className="grid gap-4">
          {boards.map((board, i) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            >
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg hover:border-white/20 transition-all duration-300">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg font-semibold">
                      <Link href={`/boards/${board.slug}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <MessageSquare className="h-5 w-5 text-primary/80" />
                        {board.title}
                      </Link>
                    </CardTitle>
                    {board.description ? (
                      <CardDescription className="max-w-3xl text-sm text-muted-foreground">
                        {board.description}
                      </CardDescription>
                    ) : null}
                  </div>
                  <Badge className="bg-primary/20 text-primary-foreground border-primary/30">スレッド {board.threads}</Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-0 text-xs text-muted-foreground">
                  <span>最終更新: {new Date(board.activityAt).toLocaleString('ja-JP')}</span>
                  <Link href={`/boards/${board.slug}`} className="inline-flex items-center gap-1 text-primary font-semibold hover:underline">
                    掲示板へ
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {boards.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                まだ掲示板がありません。
              </CardContent>
            </Card>
          ) : null}
        </div>
      </motion.section>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const boards = await listBoards();

  return {
    props: {
      boards: boards.map((board) => ({
        ...board,
        activityAt: board.activityAt.toISOString(),
      })),
    },
  };
};
