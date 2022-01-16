import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { chatConfig } from 'src/config/chat.config';

@WebSocketGateway(chatConfig.port)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  handleConnection(client: Socket) {
    //
  }

  handleDisconnect(client: Socket) {
    //
  }
}
