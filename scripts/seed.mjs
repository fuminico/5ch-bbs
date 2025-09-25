import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  await prisma.board.createMany({
    data: [
      { slug: 'general', title: 'General Chat', description: 'Anything goes' },
      { slug: 'tech', title: 'Tech', description: 'Programming talk' },
    ],
  });
  console.log('Seeded boards');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
