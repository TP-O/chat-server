import { PrismaClient } from '@prisma/client';
import { seedFriendRelationshipType } from './friend-relationship-type.seeder';
import { seedFriendRelationship } from './friend-relationship.seeder';
import { seedPersonalAccessToken } from './personal-action-token.seeder';
import { seedPlayerState } from './player-state.seeder';
import { seedPlayerStatus } from './player-status.seeder';
import { seedPlayer } from './player.seeder';

const client = new PrismaClient();

async function main() {
  await seedPlayer(client);
  await seedPersonalAccessToken(client);
  await seedFriendRelationshipType(client);
  await seedFriendRelationship(client);
  await seedPlayerStatus(client);
  await seedPlayerState(client);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await client.$disconnect();
  });
