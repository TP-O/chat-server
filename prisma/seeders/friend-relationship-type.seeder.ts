import { PrismaClient } from '@prisma/client';

export async function seedFriendRelationshipType(client: PrismaClient) {
  return client.friendRelationshipType.createMany({
    data: [
      {
        name: 'First asked',
      },
      {
        name: 'Second asked',
      },
    ],
  });
}
