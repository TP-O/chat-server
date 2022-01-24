import { ConfigModuleOptions } from '@nestjs/config';
import { appConfig } from './app.config';
import { cacheConfig } from './cache.config';
import { socketConfig } from './socket.config';

const configuration = () => ({
  app: appConfig,
  cache: cacheConfig,
  socket: socketConfig,
});

export const configOptions: ConfigModuleOptions = {
  envFilePath: ['.env', '.env.test'],
  isGlobal: true,
  load: [configuration],
};
