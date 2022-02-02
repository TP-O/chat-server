import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { Room } from 'src/types/room.type';

@Injectable()
export class CacheService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) public readonly manager: Cache,
  ) {}

  /**
   * Get player's id from player's socket id.
   *
   * @param socketId player's socket id.
   */
  getPlayerId(socketId: string): Promise<number> {
    return this.manager.get<number>(
      `${this.configService.get('state.branch.socketIdToId')}${socketId}`,
    );
  }

  /**
   * Get player's socket id from player's id.
   *
   * @param playerId player's id.
   */
  getSocketId(playerId: number): Promise<string> {
    return this.manager.get<string>(
      `${this.configService.get('state.branch.idToSocketId')}${playerId}`,
    );
  }

  /**
   * Add player's socket id and player's id to cache.
   * Always return true.
   *
   * @param socketId player's socket id.
   * @param playerId player's id.
   */
  async addPlayer(socketId: string, playerId: number): Promise<boolean> {
    await this.manager.set(
      `${this.configService.get('state.branch.idToSocketId')}${playerId}`,
      socketId,
      { ttl: 0 },
    );
    await this.manager.set(
      `${this.configService.get('state.branch.socketIdToId')}${socketId}`,
      playerId,
      { ttl: 0 },
    );

    return true;
  }

  /**
   * Remove player's socket id and player's id from cache.
   *
   * @param socketId player's socket id.
   */
  async removePlayer(socketId: string): Promise<boolean> {
    const playerId = await this.getPlayerId(socketId);

    if (!Number.isInteger(playerId)) {
      return false;
    }

    await this.manager.del(
      `${this.configService.get('state.branch.idToSocketId')}${playerId}`,
    );
    await this.manager.del(
      `${this.configService.get('state.branch.socketIdToId')}${socketId}`,
    );

    return true;
  }

  /**
   * Get a room.
   *
   * @param roomId room's id.
   */
  getRoom(roomId: string): Promise<Room> {
    return this.manager.get<Room>(
      `${this.configService.get('state.branch.rooms')}${roomId}`,
    );
  }

  /**
   * Add new room to cache.
   *
   * @param room room's information.
   */
  addRoom(room: Room): Promise<Room> {
    return this.manager.set(
      `${this.configService.get('state.branch.rooms')}${room.id}`,
      room,
    );
  }

  /**
   * Remove a room from cache.
   *
   * @param roomId room's id.
   */
  async removeRoom(roomId: string): Promise<boolean> {
    return (await this.manager.del(
      `${this.configService.get('state.branch.rooms')}${roomId}`,
    ))
      ? true
      : false;
  }

  /**
   * Get room's id from player's socket id.
   *
   * @param socketId player's socket id.
   */
  getRoomOfPlayer(socketId: string): Promise<string> {
    return this.manager.get<string>(
      `${this.configService.get('state.branch.socketIdToRoomId')}${socketId}`,
    );
  }

  /**
   * Set room's id for player's socket id.
   *
   * @param socketId player's socket id.
   * @param roomId room's id.
   */
  async addPlayerToRoom(socketId: string, roomId: string): Promise<boolean> {
    return (
      (await this.manager.set(
        `${this.configService.get('state.branch.socketIdToRoomId')}${socketId}`,
        roomId,
      )) === 'OK'
    );
  }

  /**
   * Remove the player from the current room.
   *
   * @param socketId player's socket id.
   */
  async removePlayerFromRoom(socketId: string): Promise<boolean> {
    return (
      (await this.manager.del(
        `${this.configService.get('state.branch.socketIdToRoomId')}${socketId}`,
      )) === '1'
    );
  }
}
