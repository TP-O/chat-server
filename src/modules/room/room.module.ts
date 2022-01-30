import { CacheModule as NestjsCacheModule, Module } from '@nestjs/common';
import { cacheConfig } from 'src/configs/cache.config';
import { CacheModule } from '../cache/cache.module';
import { RoomService } from './room.service';

@Module({
  imports: [NestjsCacheModule.register(cacheConfig), CacheModule],
  exports: [RoomService],
  providers: [RoomService],
})
export class RoomModule {}
