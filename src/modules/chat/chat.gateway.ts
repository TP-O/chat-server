import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { validationConfig } from 'src/configs/validation.config';
import { AllExceptionsFilter } from 'src/filters/all-exception.filter';
import { AuthService } from '../auth/auth.service';
import { CacheService } from '../cache/cache.service';
import { PrivateMessageRequest } from './dto/private-message.request';
import { ChatService } from './services/chat.service';
import { MessageService } from './services/message.service';
import { PlayerService } from './services/player.service';
import { Event } from './types/event.type';

@UsePipes(new ValidationPipe(validationConfig))
@UseFilters(new AllExceptionsFilter())
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,
    private readonly chatService: ChatService,
    private readonly playerService: PlayerService,
    private readonly messageService: MessageService,
  ) {}

  /**
   * Verify socket connection.
   *
   * @param socket connected socket.
   */
  async handleConnection(socket: Socket): Promise<any> {
    const playerId = await this.authService.verify(
      socket.handshake.headers.authorization,
    );

    if (!playerId) {
      socket.emit(Event.FAILURE, {
        event: Event.CONNECTION,
        messages: ['Unauthenticated!'],
      });

      return socket.disconnect();
    }

    return this.chatService.connect(this.server, socket.id, playerId);
  }

  /**
   * Update status for disconnected player.
   *
   * @param socket connected socket.
   */
  handleDisconnect(socket: Socket): Promise<void> {
    return this.chatService.disconnect(this.server, socket.id);
  }

  /**
   * Handle private message from the player.
   *
   * @param socket connected socket.
   * @param data event's data.
   */
  @SubscribeMessage(Event.PRIVATE_MESSAGE)
  async handlePrivateMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: PrivateMessageRequest,
  ) {
    const senderId = await this.cacheService.getPlayerId(socket.id);
    const areFriends = await this.playerService.areFriends(
      senderId,
      message.receiver_id,
    );

    if (!areFriends) {
      throw new Error('Only friends can send messages to each other!');
    }

    const privateMessage = await this.messageService.storePrivateMessage({
      sender_id: senderId,
      receiver_id: message.receiver_id,
      content: message.content,
    });

    return this.chatService.sendPrivateMessage(
      this.server,
      message.identifier,
      privateMessage,
    );
  }
}
