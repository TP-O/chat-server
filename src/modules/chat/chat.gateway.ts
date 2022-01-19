import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { chatConfig } from 'src/config/chat.config';
import { AuthService } from '../auth/auth.service';

const cache = {
  ids: new Map<number, string>(),
  sids: new Map<string, number>(),
};

@WebSocketGateway(chatConfig.port)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    const id = await this.authService.verify(
      client.handshake.headers.authorization,
    );

    if (id === 0) {
      client.disconnect();
    } else {
      cache.ids.set(id, client.id);
      cache.sids.set(client.id, id);
    }

    console.log(cache);
  }

  handleDisconnect(client: Socket) {
    const id = cache.sids.get(client.id);

    cache.ids.delete(id);
    cache.sids.delete(client.id);

    console.log(cache);
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
