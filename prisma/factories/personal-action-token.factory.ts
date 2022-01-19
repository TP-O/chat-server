import { create } from './factory';
import { createHash } from 'crypto';

export function createPersonalAccessTokens(count = 1) {
  return create(
    () => ({
      tokenable_type: 'App\\Models\\Player',
      tokenable_id: 1,
      name: 'sign-in',
      token: createHash('sha256')
        .update('PcaZbCVnyZQuFajTgvNtSMyBAjbG3A1YQiwB43r3')
        .digest('hex'),
      abilities: '["*"]',
    }),
    count,
  );
}
