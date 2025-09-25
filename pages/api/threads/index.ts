import type { NextApiRequest, NextApiResponse } from 'next';
import { listThreads } from '../../../lib/queries';

type ThreadSummaryPayload = {
  id: string;
  title: string;
  replies: number;
  lastBumpedAt: string;
};

type Response =
  | { threads: ThreadSummaryPayload[] }
  | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const boardId = typeof req.query.boardId === 'string' ? req.query.boardId : null;
  if (!boardId) {
    return res.status(400).json({ error: 'boardId is required' });
  }

  try {
    const threads = await listThreads(boardId);
    return res.status(200).json({
      threads: threads.map((thread) => ({
        ...thread,
        lastBumpedAt: thread.lastBumpedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'スレッド一覧の取得に失敗しました' });
  }
}
