import { PrismaClient } from '@prisma/client';
import { seedPersonalAccessToken } from './personal-action-token.seeder';
import { seedPlayer } from './player.seeder';

const client = new PrismaClient();

async function main() {
  await seedPlayer(client);
  await seedPersonalAccessToken(client);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await client.$disconnect();
  });
