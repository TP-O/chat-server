import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private readonly prismaService: PrismaService) {}

  store(message: Prisma.PrivateMessageUncheckedCreateInput) {
    return this.prismaService.privateMessage.create({
      select: {
        content: true,
      },
      data: message,
    });
  }
}
