import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { chatConfig } from 'src/configs/chat.config';
import { AuthService } from '../auth/auth.service';
import { MessageService } from './services/message.service';
import { PlayerService } from './services/player.service';
import { Event } from './types/event.type';
import { Status, StatusId } from './types/status.type';

const cache = new Map<string, number>();

@WebSocketGateway(chatConfig.port)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly playerService: PlayerService,
    private readonly messageService: MessageService,
  ) {}

  async handleConnection(client: Socket) {
    const playerId = await this.authService.verify(
      client.handshake.headers.authorization,
    );

    if (!playerId) {
      client.disconnect();

      return;
    }

    const player = await this.playerService.makeOnline(playerId, client.id);
    const friendList = await this.playerService.getFriendList(playerId);

    cache.set(client.id, playerId);

    // Announce online player to their online friends
    this.server
      .to(
        friendList
          .filter((f) => f.state.status_id === StatusId.ONLINE)
          .map((f) => f.state.socket_id),
      )
      .emit(Event.FRIEND_STATUS, player);

    // Send friend list to the player
    this.server.to(client.id).emit(Event.FRIEND_LIST, friendList);
  }

  async handleDisconnect(client: Socket) {
    if (client.handshake.headers.authorization === undefined) {
      return;
    }

    const { player_id: playerId } = await this.playerService.makeOffline(
      client.id,
    );

    cache.delete(client.id);

    const onlineFriends = await this.playerService.getOnlineFriends(playerId);

    // Announce offline player to their online friends
    this.server
      .to(onlineFriends.map((f) => f.state.socket_id))
      .emit(Event.FRIEND_STATUS, {
        id: playerId,
        state: { status: { name: Status.OFFLINE } },
      });
  }

  @SubscribeMessage(Event.PRIVATE_MESSAGE)
  async handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: any,
  ) {
    const senderId = cache.get(client.id);

    const prviateMessage = await this.messageService.store({
      sender_id: senderId,
      receiver_id: message.receiver_id,
      content: message.content,
    });

    if (prviateMessage?.content !== message.content) {
      this.server.to(client.id).emit(Event.FAILED_PRIVATE_MESSAGE, {
        reveiver_id: message.receiver_id,
        content: message.content,
      });
    } else {
      this.server.to(message.socket_id).emit(Event.PRIVATE_MESSAGE, {
        sender_id: senderId,
        content: message.content,
      });
    }
  }
}
