import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { chatConfig } from 'src/config/chat.config';
import { AuthService } from '../auth/auth.service';
import { ChatService } from './services/chat.service';
import { PlayerService } from './services/player.service';
import { Event } from './types/event.type';
import { Status, StatusId } from './types/status.type';

@WebSocketGateway(chatConfig.port)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
    private readonly playerService: PlayerService,
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
    const { player_id: playerId } = await this.playerService.makeOffline(
      client.id,
    );

    const onlineFriends = await this.playerService.getOnlineFriends(playerId);

    // Announce offline player to their online friends
    this.server
      .to(onlineFriends.map((f) => f.state.socket_id))
      .emit(Event.FRIEND_STATUS, {
        id: playerId,
        state: { status: { name: Status.OFFLINE } },
      });
  }

  // @SubscribeMessage(EventType.PRIVATE_MESSAGE)
  // handlePrivateMessage(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() message: PrivateMessage,
  // ): any {
  //   console.log(message);
  //   console.log(this.server.of('/').adapter.rooms);

  //   this.server.to(client.id).emit(EventType.PRIVATE_MESSAGE_REPLY, message);
  // }
}
