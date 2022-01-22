import * as redisStore from 'cache-manager-redis-store';
import { CacheModuleOptions } from '@nestjs/common';
import { env } from 'process';

export const cacheConfig: CacheModuleOptions = {
  store: redisStore,
  host: env.REDIS_HOST || 'redis',
  port: Number(env.REDIS_PORT) || 6379,
  password: env.REDIS_PASSWORD || 'redis_password',
  ttl: 60 * 60,
};
