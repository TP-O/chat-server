import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './services/chat.service';
import { PlayerService } from './services/player.service';

@Module({
  imports: [AuthModule],
  providers: [ChatGateway, PrismaService, ChatService, PlayerService],
})
export class ChatModule {}
