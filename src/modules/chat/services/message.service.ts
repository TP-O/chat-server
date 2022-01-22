import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { socketConfig } from 'src/configs/socket.config';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PrivateMessageBody } from '../dto/private-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Store new message.
   *
   * @param senderSocketId sender's socket id.
   * @param message stored message.
   */
  async storePrivateMessage(
    senderSocketId: string,
    message: PrivateMessageBody,
  ) {
    const senderId = await this.cacheManager.get<number>(
      `${socketConfig.cacheKeys.SOCKET_ID_MAP_ID}${senderSocketId}`,
    );

    if (!Number.isInteger(senderId)) {
      return null;
    }

    return this.prismaService.privateMessage.create({
      select: {
        sender_id: true,
        receiver_id: true,
        content: true,
      },
      data: {
        sender_id: senderId,
        ...message,
      },
    });
  }
}
