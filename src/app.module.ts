import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configOptions } from './configs/option.config';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [ConfigModule.forRoot(configOptions), ChatModule],
})
export class AppModule {}
