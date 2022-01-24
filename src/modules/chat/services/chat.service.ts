import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Cache } from 'cache-manager';
import { Server } from 'socket.io';
import { socketConfig } from 'src/configs/socket.config';
import { Event } from '../types/event.type';
import { Status, StatusId } from '../types/status.type';
import { PlayerService } from './player.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly playerService: PlayerService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Connect player to the the server then announce to online friends.
   *
   * @param server socket server instance.
   * @param socketId player's socket id.
   * @param playerId player's id.
   */
  async connect(server: Server, socketId: string, playerId: number) {
    const player = await this.playerService.makeOnline(playerId, socketId);
    const friendList = await this.playerService.getFriendList(playerId);

    // Announce online player to their online friends
    server
      .to(
        friendList
          .filter((f) => f.state.status_id === StatusId.ONLINE)
          .map((f) => f.state.socket_id),
      )
      .emit(Event.FRIEND_STATUS, player);

    // Send friend list to the player
    server.to(socketId).emit(Event.FRIEND_LIST, friendList);
  }

  /**
   * Disconnect player from the server then announce to online friends.
   *
   * @param server socket server instance.
   * @param socketId player's socket id.
   */
  async disconnect(server: Server, socketId: string) {
    const { player_id: playerId } = await this.playerService.makeOffline(
      socketId,
    );

    const onlineFriends = await this.playerService.getOnlineFriends(playerId);

    // Announce offline player to their online friends
    server
      .to(onlineFriends.map((f) => f.state.socket_id))
      .emit(Event.FRIEND_STATUS, {
        id: playerId,
        state: { status: { name: Status.OFFLINE } },
      });
  }

  /**
   * Store new message then notify the recipients.
   *
   * @param server socket server instance.
   * @param senderSocketId sender's socket id.
   * @param privateMessage stored message.
   */
  async sendPrivateMessage(
    server: Server,
    privateMessage: Prisma.PrivateMessageUncheckedCreateInput,
  ) {
    const receiverSocketId = await this.cacheManager.get<string>(
      `${socketConfig.cacheKeys.ID_MAP_SOCKET_ID}${privateMessage.receiver_id}`,
    );

    // Do not nofity if receiver is offline
    if (receiverSocketId !== undefined) {
      server.to(receiverSocketId).emit(Event.PRIVATE_MESSAGE, {
        sender_id: privateMessage.sender_id,
        content: privateMessage.content,
      });
    }
  }
}
