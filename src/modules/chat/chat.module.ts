import { CacheModule, Module } from '@nestjs/common';
import { cacheConfig } from 'src/configs/cache.config';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './services/chat.service';
import { MessageService } from './services/message.service';
import { PlayerService } from './services/player.service';

@Module({
  imports: [AuthModule, CacheModule.register(cacheConfig)],
  providers: [
    ChatGateway,
    PrismaService,
    MessageService,
    PlayerService,
    ChatService,
  ],
})
export class ChatModule {}
