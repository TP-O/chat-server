import { Injectable } from '@nestjs/common';
import { generate as generateRoomId } from 'randomstring';
import { Socket } from 'socket.io';
import { stateConfig } from 'src/configs/state.config';
import { CacheService } from 'src/modules/cache/cache.service';
import { RoomJoiningRequest } from './dto/room-joining.request';
import { CreateRoomOutput, Room } from 'src/types/room.type';

@Injectable()
export class RoomService {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Get a room by id.
   *
   * @param roomId room's id.
   */
  async getRoom(roomId: string): Promise<Room> {
    const room = await this.cacheService.getRoom(roomId);

    if (!room) {
      throw new Error('Room does not exist!');
    }

    return room;
  }

  /**
   * Create a new room.
   *
   * @param roomInput room's data input.
   */
  async createRoom(
    roomInput: Omit<Room, 'id' | 'remaining'>,
  ): Promise<CreateRoomOutput> {
    const roomId = generateRoomId({ length: stateConfig.roomIdLength });
    const remaining = roomInput.slots - 1;

    await this.cacheService.addRoom({
      id: roomId,
      remaining,
      ...roomInput,
    });

    return {
      id: roomId,
      slots: roomInput.slots,
      remaining,
    };
  }

  /**
   * Update a room.
   *
   * @param roomId room's id.
   * @param roomUpdateInput room's new data.
   */
  async updateRoom(
    roomId: string,
    roomUpdateInput: Partial<Omit<Room, 'id'>>,
  ): Promise<Room> {
    const room = await this.getRoom(roomId);

    // Override old data
    const newRoom = {
      ...room,
      ...roomUpdateInput,
    };

    this.cacheService.addRoom(newRoom);

    return newRoom;
  }

  /**
   * Delete a room.
   *
   * @param roomId room's id.
   */
  deleteRoom(roomId: string): Promise<boolean> {
    return this.cacheService.removeRoom(roomId);
  }

  /**
   * Check if room request is valid.
   *
   * @param request join room request.
   */
  async validateRoom(request: RoomJoiningRequest) {
    const room = await this.cacheService.getRoom(request.room_id);

    if (!room) {
      throw new Error('Room does not exist!');
    }

    if (room.is_private && room.password !== request.password) {
      throw new Error('Incorrect password!');
    }

    if (room.remaining <= 0) {
      throw new Error('Room is full!');
    }

    return room;
  }

  /**
   * Modify `remaining` filed of the room.
   *
   * @param roomId room's id.
   * @param delta amount of chage.
   */
  async increaseNumberOfMembers(
    roomId: string,
    delta = 1,
  ): Promise<Room | null> {
    const room = await this.getRoom(roomId);

    room.remaining += delta;

    if (room.remaining >= room.slots) {
      await this.deleteRoom(roomId);

      return null;
    }

    await this.cacheService.addRoom(room);

    return room;
  }

  /**
   * Check if the player is in a room.
   *
   * @param socket connected socket.
   */
  isPlayerInRoom(socket: Socket): boolean {
    return socket.rooms.size >= 2;
  }

  /**
   * Elect a new owner for room.
   *
   * @param roomId room's id.
   * @param socketIdLists list of joined socket ids.
   */
  async electNewOwner(
    roomId: string,
    socketIdLists: Set<string>,
  ): Promise<string> {
    const newOwnerSocketId = socketIdLists.values().next().value;

    const newRoom = await this.updateRoom(roomId, {
      owner_socket_id: newOwnerSocketId,
    });

    return newRoom.owner_socket_id;
  }
}
