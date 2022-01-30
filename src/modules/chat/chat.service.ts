import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CacheService } from '../cache/cache.service';
import { PrivateMessageRequest } from '../message/dto/private-message.request';
import { MessageService } from '../message/message.service';
import { NotificationService } from '../notification/notification.service';
import { PlayerService } from '../player/player.service';
import { RoomCreationRequest } from '../room/dto/room-creation.request';
import { RoomJoiningRequest } from '../room/dto/room-joining.request';
import { RoomService } from '../room/room.service';
import { Event } from 'src/types/event.type';
import { Status } from 'src/types/status.type';
import { GroupMessageRequest } from '../message/dto/group-message.request';

@Injectable()
export class ChatService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly notificationService: NotificationService,
    private readonly playerService: PlayerService,
    private readonly roomService: RoomService,
    private readonly messageService: MessageService,
  ) {}

  /**
   * Connect player to the the server then announce to online friends.
   *
   * @param server socket server instance.
   * @param socket connected socket.
   * @param playerId player's id.
   */
  async connect(
    server: Server,
    socket: Socket,
    playerId: number,
  ): Promise<void> {
    const player = await this.playerService.makeOnline(playerId, socket.id);
    const friendList = await this.playerService.getFriendList(playerId);
    const onlineFriendSocketIds = friendList
      .filter((f) => f.state.status.name !== Status.OFFLINE)
      .map((f) => f.state.socket_id);

    // Announce online player to their online friends
    this.notificationService.notify({
      server,
      to: onlineFriendSocketIds,
      event: Event.FRIEND_STATUS,
      notification: {
        data: player,
      },
    });

    // Send friend list to the player
    this.notificationService.notify({
      server,
      to: socket.id,
      event: Event.FRIEND_LIST,
      notification: {
        data: friendList,
      },
    });
  }

  /**
   * Disconnect player from the server then announce to online friends.
   *
   * @param server socket server instance.
   * @param socket connected socket.
   */
  async disconnect(server: Server, socket: Socket): Promise<void> {
    await this.leaveRoom(server, socket, false).catch(() => {
      //
    });

    const { player_id: playerId } = await this.playerService.makeOffline(
      socket.id,
    );

    if (!playerId) {
      return;
    }

    const onlineFriends = await this.playerService.getOnlineFriends(playerId);

    // Announce offline player to their online friends
    this.notificationService.notify({
      server,
      to: onlineFriends.map((f) => f.state.socket_id),
      event: Event.FRIEND_STATUS,
      notification: {
        data: {
          id: playerId,
          state: { status: { name: Status.OFFLINE } },
        },
      },
    });
  }

  /**
   * Store new message then notify the recipients.
   *
   * @param server socket server instance.
   * @param socket connected socket.
   * @param request send message request.
   */
  async sendPrivateMessage(
    server: Server,
    socket: Socket,
    request: PrivateMessageRequest,
  ): Promise<void> {
    const senderId = await this.cacheService.getPlayerId(socket.id);
    const areFriends = await this.playerService.areFriends(
      senderId,
      request.receiver_id,
    );

    if (!areFriends) {
      throw new Error('Only friends can send messages to each other!');
    }

    const privateMessage = await this.messageService.storePrivateMessage({
      sender_id: senderId,
      receiver_id: request.receiver_id,
      content: request.content,
    });

    const receiverSocketId = await this.cacheService.getSocketId(
      privateMessage.receiver_id,
    );

    // Notify online receiver
    this.notificationService.notify({
      server,
      to: receiverSocketId,
      event: Event.PRIVATE_MESSAGE,
      notification: {
        data: {
          identifier: request.identifier,
          sender_id: privateMessage.sender_id,
          content: privateMessage.content,
        },
      },
    });

    this.notificationService.notifySuccess({
      server,
      to: socket.id,
      notification: {
        event: Event.PRIVATE_MESSAGE,
        message: 'Message has been sent!',
        data: {
          identifier: request.identifier,
          receiver_id: privateMessage.receiver_id,
        },
      },
    });
  }

  /**
   * Create a new room and then allow player to join it.
   *
   * @param server socket server instance.
   * @param socket connected socket.
   * @param request create room request.
   */
  async createRoom(
    server: Server,
    socket: Socket,
    request: RoomCreationRequest,
  ): Promise<void> {
    if (this.roomService.isPlayerInRoom(socket)) {
      throw new Error('You have been in a room');
    }

    const room = await this.roomService.createRoom({
      owner_socket_id: socket.id,
      ...request,
    });

    // Add the player to the room
    await this.playerService.joinRoom(socket, room.room_id);

    this.notificationService.notifySuccess({
      server,
      to: socket.id,
      notification: {
        event: Event.ROOM_CREATION,
        message: 'Room created successfully!',
        data: room,
      },
    });
  }

  /**
   * Check room request and then allow player to join the room.
   *
   * @param server socket server instance.
   * @param socket connected socket.
   * @param request join room request.
   */
  async joinRoom(
    server: Server,
    socket: Socket,
    request: RoomJoiningRequest,
  ): Promise<void> {
    if (this.roomService.isPlayerInRoom(socket)) {
      throw new Error('You have been in a room');
    }

    const room = await this.roomService.validateRoom(request);

    // Add the player to the room
    const player = await this.playerService.joinRoom(socket, room.id);
    const members = await this.playerService.getPlayersBySocketIds(
      Array.from(server.of('').adapter.rooms.get(room.id)),
    );

    // Decrease remaining slot by 1
    const newRoom = await this.roomService.increaseNumberOfMembers(room.id, -1);

    this.notificationService.notifySuccess({
      server,
      to: socket.id,
      notification: {
        event: Event.ROOM_JOINING,
        message: 'Joined the room!',
        data: {
          room_id: newRoom.id,
          is_private: newRoom.is_private,
          slots: newRoom.slots,
          remaining: newRoom.remaining,
          members: members.map((m: any) => {
            m.owner = m.state.socket_id === room.owner_socket_id;

            delete m.state;

            return m;
          }),
        },
      },
    });

    this.notificationService.notify({
      server,
      to: newRoom.id,
      event: Event.ROOM_JOINING_BROADCASTING,
      notification: {
        message: `${player.username} has joined the room!`,
        data: player,
      },
    });
  }

  /**
   * Kick the player out of the current room.
   *
   * @param server socket server instance.
   * @param socket connected socket.
   * @param isOnline check if user disconnected or just leave the room.
   */
  async leaveRoom(server: Server, socket: Socket, isOnline?: boolean) {
    const { roomId, player } = await this.playerService.leaveCurrentRoom(
      socket,
      isOnline,
    );

    // Increase remaining slot by 1
    const room = await this.roomService.increaseNumberOfMembers(roomId);

    // Elect new room owner
    if (room && room.owner_socket_id === socket.id) {
      this.roomService.electNewOwner(
        roomId,
        server.of('').adapter.rooms.get(roomId),
      );
    }

    this.notificationService.notifySuccess({
      server,
      to: socket.id,
      notification: {
        event: Event.ROOM_LEAVING,
        message: 'Leave the room!',
      },
    });

    this.notificationService.notify({
      server,
      to: room.id,
      event: Event.ROOM_JOINING_BROADCASTING,
      notification: {
        message: `${player.username} has leave the room!`,
        data: player,
      },
    });
  }

  /**
   * Send message to a room.
   *
   * @param server socket server instance.
   * @param socket connected socket.
   * @param request send message request.
   */
  async sendGroupMessage(
    server: Server,
    socket: Socket,
    request: GroupMessageRequest,
  ): Promise<void> {
    const senderId = await this.cacheService.getPlayerId(socket.id);
    const roomId = await this.cacheService.getRoomOfPlayer(socket.id);

    if (!roomId) {
      throw new Error('You are not in a room!');
    }

    // Notify members in the room
    this.notificationService.notify({
      server,
      to: roomId,
      event: Event.ROOM_MESSAGE,
      notification: {
        data: {
          identifier: request.identifier,
          sender_id: senderId,
          content: request.content,
        },
      },
    });

    this.notificationService.notifySuccess({
      server,
      to: socket.id,
      notification: {
        event: Event.ROOM_MESSAGE,
        message: 'Message has been sent!',
        data: {
          identifier: request.identifier,
        },
      },
    });
  }
}
