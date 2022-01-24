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
import { socketConfig } from 'src/configs/socket.config';
import { AllExceptionsFilter } from 'src/filters/all-exception.filter';
import { AuthService } from '../auth/auth.service';
import { PrivateMessageBody } from './dto/private-message.dto';
import { ChatService } from './services/chat.service';
import { MessageService } from './services/message.service';
import { Event } from './types/event.type';

@WebSocketGateway(socketConfig.port)
@UsePipes(new ValidationPipe())
@UseFilters(new AllExceptionsFilter())
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  /**
   * Verify socket connection.
   *
   * @param socket connected socket.
   */
  async handleConnection(socket: Socket) {
    const playerId = await this.authService.verify(
      socket.handshake.headers.authorization || '',
    );

    if (!playerId) {
      this.handleFailedEvent(socket.id, 'CONNECTION', ['Unauthenticated']);

      return socket.disconnect();
    }

    this.chatService.connect(this.server, socket.id, playerId);
  }

  /**
   * Update status for disconnected player.
   *
   * @param socket connected socket.
   */
  async handleDisconnect(socket: Socket) {
    this.chatService.disconnect(this.server, socket.id);
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
    @MessageBody() message: PrivateMessageBody,
  ) {
    const prviateMessage = await this.messageService.storePrivateMessage(
      socket.id,
      message,
    );

    if (!prviateMessage) {
      this.handleFailedEvent(
        socket.id,
        Event.PRIVATE_MESSAGE,
        ['Unable to send this message'],
        message,
      );
    } else {
      this.chatService.sendPrivateMessage(this.server, prviateMessage);
    }
  }

  /**
   * Handle failed event.
   *
   * @param socketId connected socket id.
   * @param event event's name.
   * @param messages error messages.
   * @param messageBody event's message body.
   */
  private handleFailedEvent(
    socketId: string,
    event: string,
    messages: string[],
    messageBody?: any,
  ) {
    this.server.to(socketId).emit(Event.EXCEPTION, {
      event,
      messages,
      data: messageBody,
    });
  }
}
