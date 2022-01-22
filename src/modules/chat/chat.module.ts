import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from './chat.gateway';
import { MessageService } from './services/message.service';
import { PlayerService } from './services/player.service';

@Module({
  imports: [AuthModule],
  providers: [ChatGateway, PrismaService, MessageService, PlayerService],
})
export class ChatModule {}
