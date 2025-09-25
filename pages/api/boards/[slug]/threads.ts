import type { NextApiRequest, NextApiResponse } from 'next';
import { getBoardWithThreads } from '../../../../lib/queries';

type ThreadSummaryPayload = {
  id: string;
  title: string;
  replies: number;
  lastBumpedAt: string;
};

type BoardResponse =
  | {
      board: {
        id: string;
        slug: string;
        title: string;
        description: string | null;
      };
      threads: ThreadSummaryPayload[];
    }
  | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<BoardResponse>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const slug = typeof req.query.slug === 'string' ? req.query.slug : null;
  if (!slug) {
    return res.status(400).json({ error: 'slug is required' });
  }

  try {
    const board = await getBoardWithThreads(slug);

    if (!board) {
      return res.status(404).json({ error: '指定された板は見つかりませんでした' });
    }

    return res.status(200).json({
      board: board.board,
      threads: board.threads.map((thread) => ({
        ...thread,
        lastBumpedAt: thread.lastBumpedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'スレッド一覧の取得に失敗しました' });
  }
}
