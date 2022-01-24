import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configOptions } from './configs/config-module.config';
import { ChatModule } from './modules/chat/chat.module';
import { PrismaService } from './modules/prisma/prisma.service';

@Module({
  imports: [ConfigModule.forRoot(configOptions), ChatModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
