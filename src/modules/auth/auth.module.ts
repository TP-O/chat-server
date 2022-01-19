import { Module } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  exports: [AuthService],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
