import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configOptions } from 'src/configs/option.config';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';
import { MessageModule } from '../message/message.module';
import { NotificationModule } from '../notification/notification.module';
import { PlayerModule } from '../player/player.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RoomModule } from '../room/room.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [
    ConfigModule.forRoot(configOptions),
    CacheModule,
    PrismaModule,
    AuthModule,
    NotificationModule,
    PlayerModule,
    MessageModule,
    RoomModule,
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
