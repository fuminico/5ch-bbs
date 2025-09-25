import type { NextApiRequest, NextApiResponse } from 'next';
import { getThreadWithPosts } from '../../../lib/queries';

type PostPayload = {
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

type ThreadPayload =
  | {
      thread: {
        id: string;
        title: string;
        boardId: string;
        boardSlug: string;
        boardTitle: string;
      };
      posts: PostPayload[];
    }
  | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ThreadPayload>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const id = typeof req.query.id === 'string' ? req.query.id : null;
  if (!id) {
    return res.status(400).json({ error: 'thread id is required' });
  }

  try {
    const thread = await getThreadWithPosts(id);

    if (!thread) {
      return res.status(404).json({ error: '指定されたスレッドは見つかりませんでした' });
    }

    return res.status(200).json({
      thread: thread.thread,
      posts: thread.posts.map((post) => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'スレッド詳細の取得に失敗しました' });
  }
}
