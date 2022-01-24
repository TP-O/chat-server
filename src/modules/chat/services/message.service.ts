import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PrivateMessageBody } from '../dto/private-message.dto';
import { PlayerService } from './player.service';

@Injectable()
export class MessageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly playerService: PlayerService,
    private readonly configService: ConfigService,
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
      `${this.configService.get('socket.branch.sid2Id')}${senderSocketId}`,
    );
    const areFriends = await this.playerService.areFriends(
      senderId,
      message.receiver_id,
    );

    if (!Number.isInteger(senderId) || !areFriends) {
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
