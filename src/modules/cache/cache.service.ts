import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

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
      `${this.configService.get('socket.branch.sid2Id')}${socketId}`,
    );
  }

  /**
   * Get player's socket id from player's id.
   *
   * @param playerId player's id.
   */
  getSocketId(playerId: number): Promise<string> {
    return this.manager.get<string>(
      `${this.configService.get('socket.branch.id2Sid')}${playerId}`,
    );
  }

  /**
   * Add player's socket id and player's id to cache.
   *
   * @param socketId player's socket id.
   * @param playerId player's id.
   */
  async addPlayer(socketId: string, playerId: number): Promise<boolean> {
    await this.manager.set(
      `${this.configService.get('socket.branch.id2Sid')}${playerId}`,
      socketId,
      { ttl: 0 },
    );
    await this.manager.set(
      `${this.configService.get('socket.branch.sid2Id')}${socketId}`,
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
      `${this.configService.get('socket.branch.id2Sid')}${playerId}`,
    );
    await this.manager.del(
      `${this.configService.get('socket.branch.sid2Id')}${socketId}`,
    );

    return true;
  }
}
