import { IoAdapter } from '@nestjs/platform-socket.io';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { createAdapter, RedisAdapter } from '@socket.io/redis-adapter';
import { cacheConfig } from 'src/configs/cache.config';

let redisAdapter: (ns: any) => RedisAdapter;

const pubClient = createClient({
  url: cacheConfig.url,
  password: cacheConfig.password,
});
const subClient = pubClient.duplicate();

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      redisAdapter = createAdapter(pubClient, subClient);

      server.adapter(redisAdapter);
    });

    return server;
  }
}
