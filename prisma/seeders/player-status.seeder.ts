import { PrismaClient } from '@prisma/client';

export async function seedPlayerStatus(client: PrismaClient) {
  return client.playerStatus.createMany({
    data: [
      {
        name: 'Online',
      },
      {
        name: 'Busy',
      },
      {
        name: 'Offline',
      },
      {
        name: 'Match finding',
      },
      {
        name: 'In match',
      },
    ],
  });
}
