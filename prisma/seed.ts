import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const boards = [
    {
      slug: 'news',
      title: '�j���[�X����',
      description: '�ŐV�̃j���[�X��b������L����ł��B',
    },
    {
      slug: 'tech',
      title: '�Z�p�E�v���O���~���O',
      description: '�v���O���~���O��J���k�`�͂�����B',
    },
    {
      slug: 'chat',
      title: '�G�k',
      description: '��邢�b������}���܂��B',
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
