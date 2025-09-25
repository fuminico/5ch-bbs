import type { NextApiRequest, NextApiResponse } from 'next';
import { listBoards } from '../../../lib/queries';

type BoardSummaryPayload = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  threads: number;
  activityAt: string;
};

type Response =
  | { boards: BoardSummaryPayload[] }
  | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const boards = await listBoards();

    return res.status(200).json({
      boards: boards.map((board) => ({
        ...board,
        activityAt: board.activityAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '板一覧の取得に失敗しました' });
  }
}
