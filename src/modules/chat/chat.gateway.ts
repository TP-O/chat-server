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
import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';
import { PrivateMessageRequest } from '../message/dto/private-message.request';
import { NotificationService } from '../notification/notification.service';
import { RoomCreationRequest } from '../room/dto/room-creation.request';
import { RoomJoiningRequest } from '../room/dto/room-joining.request';
import { Event } from 'src/types/event.type';
import { GroupMessageRequest } from '../message/dto/group-message.request';

@UsePipes(new ValidationPipe(validationConfig))
@UseFilters(new AllExceptionsFilter())
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Verify socket connection.
   *
   * @param socket connected socket.
   */
  async handleConnection(socket: Socket): Promise<void> {
    const playerId = await this.authService.verify(
      socket.handshake.headers.authorization,
    );

    if (!playerId) {
      this.notificationService.notifyFailure({
        server: this.server,
        to: socket.id,
        notification: {
          event: Event.CONNECTION,
          message: 'Unauthenticated!',
        },
      });

      socket.disconnect();
    } else {
      await this.chatService.connect(this.server, socket, playerId);
    }
  }

  /**
   * Update status for disconnected player.
   *
   * @param socket connected socket.
   */
  async handleDisconnect(socket: Socket): Promise<void> {
    await this.chatService.disconnect(this.server, socket);
  }

  /**
   * Handle private message from the player.
   *
   * @param socket connected socket.
   * @param request request's data.
   */
  @SubscribeMessage(Event.PRIVATE_MESSAGE)
  async handlePrivateMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() request: PrivateMessageRequest,
  ): Promise<void> {
    await this.chatService.sendPrivateMessage(this.server, socket, request);
  }

  /**
   * Handle room creation.
   *
   * @param socket connected socket.
   * @param request request's data.
   */
  @SubscribeMessage(Event.ROOM_CREATION)
  async handleRoomCreation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() request: RoomCreationRequest,
  ): Promise<void> {
    await this.chatService.createRoom(this.server, socket, request);
  }

  /**
   * Handle room joining.
   *
   * @param socket connected socket.
   * @param request request's data.
   */
  @SubscribeMessage(Event.ROOM_JOINING)
  async handRoomJoining(
    @ConnectedSocket() socket: Socket,
    @MessageBody() request: RoomJoiningRequest,
  ): Promise<void> {
    await this.chatService.joinRoom(this.server, socket, request);
  }

  /**
   * Handle room leaving.
   *
   * @param socket connected socket.
   */
  @SubscribeMessage(Event.ROOM_LEAVING)
  async handRoomEscape(@ConnectedSocket() socket: Socket) {
    await this.chatService.leaveRoom(this.server, socket);
  }

  /**
   * Handle group message from the player.
   *
   * @param socket connected socket.
   * @param request request's data.
   */
  @SubscribeMessage(Event.GROUP_MESSAGE)
  async handleGroupMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() request: GroupMessageRequest,
  ): Promise<void> {
    await this.chatService.sendGroupMessage(this.server, socket, request);
  }
}
