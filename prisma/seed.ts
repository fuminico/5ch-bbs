import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const boards = [
    {
      slug: 'news',
      title: 'ニュース速報',
      description: '最新のニュースについて語るスレです。',
    },
    {
      slug: 'tech',
      title: '技術・プログラミング',
      description: 'プログラミングに関する議論はこちら。',
    },
    {
      slug: 'chat',
      title: '雑談',
      description: 'なんでも気軽に話しましょう。',
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