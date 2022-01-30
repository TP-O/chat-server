import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MessageService } from './message.service';

@Module({
  imports: [PrismaModule],
  exports: [MessageService],
  providers: [MessageService],
})
export class MessageModule {}
