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
        <title>Anonymous BBS</title>
      </Head>

      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
          Preview Build
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Anonymous BBS Prototype</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          A local-only playground that mirrors classic text boards: boards, threads, replies, sage, tripcodes, and rotating day IDs.
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
            <h2 className="text-xl font-semibold">Boards</h2>
            <p className="text-sm text-muted-foreground">
              Sorted by recent activity. Run <code>pnpm prisma:seed</code> for starter content.
            </p>
          </div>
        </header>

        <div className="grid gap-4">
          {boards.map((board) => (
            <Card key={board.id} className="border-border/60 bg-secondary/40">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg font-semibold">
                    <Link href={`/boards/${board.slug}`} className="flex items-center gap-2 hover:text-primary">
                      <MessageSquare className="h-4 w-4" />
                      {board.title}
                    </Link>
                  </CardTitle>
                  {board.description ? (
                    <CardDescription className="max-w-3xl text-sm text-muted-foreground">
                      {board.description}
                    </CardDescription>
                  ) : null}
                </div>
                <Badge className="bg-primary/20 text-primary">Threads {board.threads}</Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0 text-xs text-muted-foreground">
                <span>Last activity {new Date(board.activityAt).toLocaleString()}</span>
                <Link href={`/boards/${board.slug}`} className="inline-flex items-center gap-1 text-primary">
                  View threads
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}

          {boards.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No boards yet. Seed local data with <code>pnpm prisma:seed</code>.
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
