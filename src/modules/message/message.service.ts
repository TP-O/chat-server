import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Store new message.
   *
   * @param message stored message.
   */
  storePrivateMessage(
    message: Prisma.PrivateMessageUncheckedCreateInput,
  ): Promise<Prisma.PrivateMessageUncheckedCreateInput> {
    return this.prismaService.privateMessage.create({
      select: {
        sender_id: true,
        receiver_id: true,
        content: true,
      },
      data: message,
    });
  }
}
