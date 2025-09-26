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
    <main className="space-y-10">
      <Head>
        <title>匿名掲示板</title>
      </Head>

      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary/80 border border-primary/10">
          プロトタイプ
        </div>
        <h1 className="text-3xl font-bold tracking-tight">匿名掲示板</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          これは、昔ながらのテキスト掲示板を模した遊び場です。掲示板、スレッド、返信、sage、トリップコード、日替わりIDなどの機能を体験できます。
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
            <h2 className="text-xl font-semibold">掲示板一覧</h2>
            <p className="text-sm text-muted-foreground">
              最近活動があった順に表示されています。
            </p>
          </div>
        </header>

        <div className="grid gap-4">
          {boards.map((board) => (
            <Card key={board.id} className="bg-white/60 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg font-semibold">
                    <Link href={`/boards/${board.slug}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                      <MessageSquare className="h-4 w-4 text-primary/70" />
                      {board.title}
                    </Link>
                  </CardTitle>
                  {board.description ? (
                    <CardDescription className="max-w-3xl text-sm text-muted-foreground">
                      {board.description}
                    </CardDescription>
                  ) : null}
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20">スレッド {board.threads}</Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0 text-xs text-muted-foreground">
                <span>最終更新: {new Date(board.activityAt).toLocaleString('ja-JP')}</span>
                <Link href={`/boards/${board.slug}`} className="inline-flex items-center gap-1 text-primary font-semibold">
                  スレッド一覧へ
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}

          {boards.length === 0 ? (
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-sm rounded-xl">
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
