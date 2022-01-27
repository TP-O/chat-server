import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './services/chat.service';
import { MessageService } from './services/message.service';
import { PlayerService } from './services/player.service';

@Module({
  imports: [AuthModule, PrismaModule, CacheModule, ConfigModule],
  providers: [ChatGateway, MessageService, PlayerService, ChatService],
})
export class ChatModule {}
