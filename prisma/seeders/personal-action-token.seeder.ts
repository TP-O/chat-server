import { PrismaClient } from '@prisma/client';
import { createPersonalAccessTokens } from '../factories/personal-action-token.factory';

export async function seedPersonalAccessToken(client: PrismaClient) {
  return client.personalAccessToken.createMany({
    data: [
      ...createPersonalAccessTokens(7).map((token, i) => ({
        ...token,
        tokenable_id: i + 1,
      })),
    ],
  });
}
