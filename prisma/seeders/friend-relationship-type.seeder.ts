import { PrismaClient } from '@prisma/client';

export async function seedFriendRelationshipType(client: PrismaClient) {
  return client.friendRelationshipType.createMany({
    data: [
      {
        name: 'first_asked',
      },
      {
        name: 'second_asked',
      },
    ],
  });
}
