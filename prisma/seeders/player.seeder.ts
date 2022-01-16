import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';
import { createPlayers } from '../factories/player.factory';

export async function seedPlayer(client: PrismaClient) {
  return client.player.createMany({
    data: [
      {
        username: 'player01',
        email: 'player01@gmail.com',
        password: hashSync('password'),
      },
      {
        username: 'player02',
        email: 'player02@gmail.com',
        password: hashSync('password'),
      },
      ...createPlayers(5),
    ],
  });
}
