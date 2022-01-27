import { NestFactory } from '@nestjs/core';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import { AppModule } from './app.module';
import { socketConfig } from './configs/socket.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Redis adapter for websocket
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  await app.listen(socketConfig.port);
}
bootstrap();
