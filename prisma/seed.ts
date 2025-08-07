import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. 유저 1000명 bulk 생성
  const usersData = Array.from({ length: 1000 }, (_, i) => ({
    loginId: `testuser${i + 1}`,
    loginPassword: 'password123',
    nickname: `테스트유저${i + 1}`,
    streamkey: `testkey${i + 1}`,
    liveStatus: false,
  }));

  const createdUsers = await prisma.$transaction(usersData.map((data) => prisma.user.create({ data })));

  // 2. 각 유저마다 YoutubeStream 1개 생성
  const youtubeStreamData = createdUsers.map((user, i) => ({
    userId: user.id,
    title: `테스트 스트림 ${i + 1}`,
    streamingUrl: `https://example.com/stream/${i + 1}`,
    thumbnail: `https://example.com/thumb/${i + 1}.jpg`,
    liveReady: 0,
  }));

  await prisma.$transaction(youtubeStreamData.map((data) => prisma.youtubeStream.create({ data })));

  console.log('Seed 완료!');
}

main()
  .catch((e: unknown) => {
    if (e instanceof Error) {
      console.error(e.message, e.stack);
    } else {
      console.error(e);
    }
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
