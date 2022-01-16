import { create } from './factory';
import * as faker from '@faker-js/faker';
import { hashSync } from 'bcryptjs';

export function createPlayers(count = 1) {
  return create(
    () => ({
      username: faker.name.firstName(),
      email: faker.internet.email(),
      password: hashSync('password'),
    }),
    count,
  );
}
