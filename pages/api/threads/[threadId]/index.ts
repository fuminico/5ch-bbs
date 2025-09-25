import type { NextApiRequest, NextApiResponse } from 'next';
import { getThreadWithPosts } from '../../../../lib/queries';

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

type ThreadResponse =
  | {
      thread: {
        id: string;
        title: string;
        board: {
          slug: string;
          title: string;
        };
      };
      posts: PostPayload[];
    }
  | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ThreadResponse>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const threadId = typeof req.query.threadId === 'string' ? req.query.threadId : null;
  if (!threadId) {
    return res.status(400).json({ error: 'threadId is required' });
  }

  try {
    const thread = await getThreadWithPosts(threadId);

    if (!thread) {
      return res.status(404).json({ error: '指定されたスレッドは見つかりませんでした' });
    }

    return res.status(200).json({
      thread: {
        id: thread.thread.id,
        title: thread.thread.title,
        board: {
          slug: thread.thread.boardSlug,
          title: thread.thread.boardTitle,
        },
      },
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
