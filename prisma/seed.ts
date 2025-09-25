import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const boards = [
    {
      slug: 'news',
      title: 'ニュース速報',
      description: '最新のニュースや話題を共有する板です。',
    },
    {
      slug: 'tech',
      title: '技術・プログラミング',
      description: 'プログラミングや開発談義はこちら。',
    },
    {
      slug: 'chat',
      title: '雑談',
      description: 'ゆるい話題を歓迎します。',
    },
  ];

  for (const board of boards) {
    const result = await prisma.board.upsert({
      where: { slug: board.slug },
      update: {
        title: board.title,
        description: board.description,
        activityAt: new Date(),
      },
      create: board,
    });

    console.log(`Board ready: ${result.title}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
