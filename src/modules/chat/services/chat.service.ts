import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Server } from 'socket.io';
import { CacheService } from 'src/modules/cache/cache.service';
import { Event } from '../types/event.type';
import {
  PrivateMessageResponse,
  Response,
  ResponseEvent,
} from '../types/response.type';
import { Status, StatusId } from '../types/status.type';
import { PlayerService } from './player.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly playerService: PlayerService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Connect player to the the server then announce to online friends.
   *
   * @param server socket server instance.
   * @param socketId player's socket id.
   * @param playerId player's id.
   */
  async connect(
    server: Server,
    socketId: string,
    playerId: number,
  ): Promise<boolean> {
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
    return server.to(socketId).emit(Event.FRIEND_LIST, friendList);
  }

  /**
   * Disconnect player from the server then announce to online friends.
   *
   * @param server socket server instance.
   * @param socketId player's socket id.
   */
  async disconnect(server: Server, socketId: string): Promise<void> {
    const { player_id: playerId } = await this.playerService.makeOffline(
      socketId,
    );

    if (!playerId) {
      return;
    }

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
   * @param identifier message's identifier.
   * @param privateMessage stored message.
   */
  async sendPrivateMessage(
    server: Server,
    identifier: any,
    privateMessage: Prisma.PrivateMessageUncheckedCreateInput,
  ): Promise<ResponseEvent<PrivateMessageResponse>> {
    const receiverSocketId = await this.cacheService.getSocketId(
      privateMessage.receiver_id,
    );

    // Notify online receiver
    if (receiverSocketId) {
      server.to(receiverSocketId).emit(Event.PRIVATE_MESSAGE, {
        identifier,
        sender_id: privateMessage.sender_id,
        content: privateMessage.content,
      });
    }

    return this.successfulResponse<PrivateMessageResponse>({
      event: Event.PRIVATE_MESSAGE,
      message: 'Message has been sent!',
      data: {
        identifier,
        receiver_id: privateMessage.receiver_id,
      },
    });
  }

  /**
   * Create response event.
   *
   * @param response response's detail.
   * @param failed check if response is exception or completion.
   */
  private response<T>(response: Response<T>, failed = false): ResponseEvent<T> {
    return {
      event: failed ? Event.FAILURE : Event.SUCCESS,
      data: response,
    };
  }

  /**
   * Create successful response.
   *
   * @param response response's detail.
   */
  successfulResponse<T>(response: Response<T>): ResponseEvent<T> {
    response.message === response.message ?? 'Completed!';

    return this.response(response);
  }

  /**
   * Create failed response.
   *
   * @param response response's detail.
   */
  failedResponse<T>(response: Response<T>): ResponseEvent<T> {
    response.message === response.message ?? 'Unexpected error!';

    return this.response(response, true);
  }
}
