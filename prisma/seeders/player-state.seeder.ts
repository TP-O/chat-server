import { PrismaClient } from '@prisma/client';

export async function seedPlayerState(client: PrismaClient) {
  return client.playerState.createMany({
    data: [
      {
        player_id: 1,
        status_id: 2,
      },
      {
        player_id: 2,
        status_id: 2,
      },
      {
        player_id: 3,
        status_id: 2,
      },
      {
        player_id: 4,
        status_id: 2,
      },
      {
        player_id: 5,
        status_id: 2,
      },
      {
        player_id: 6,
        status_id: 2,
      },
      {
        player_id: 7,
        status_id: 2,
      },
    ],
  });
}
