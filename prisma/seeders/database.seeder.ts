import { PrismaClient } from '@prisma/client';
import { seedPlayer } from './player.seeder';

const client = new PrismaClient();

async function main() {
  await seedPlayer(client);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await client.$disconnect();
  });
