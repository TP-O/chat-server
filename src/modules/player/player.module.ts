import { CacheModule as NestjsCacheModule, Module } from '@nestjs/common';
import { cacheConfig } from 'src/configs/cache.config';
import { CacheModule } from '../cache/cache.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PlayerService } from './player.service';

@Module({
  imports: [NestjsCacheModule.register(cacheConfig), CacheModule, PrismaModule],
  exports: [PlayerService],
  providers: [PlayerService],
})
export class PlayerModule {}
