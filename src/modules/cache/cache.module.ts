import { CacheModule as NestjsCacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { cacheConfig } from 'src/configs/cache.config';
import { CacheService } from './cache.service';

@Module({
  imports: [NestjsCacheModule.register(cacheConfig), ConfigModule],
  exports: [CacheService],
  providers: [CacheService, ConfigService],
})
export class CacheModule {}
