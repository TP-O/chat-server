import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Player, PlayerState } from '@prisma/client';
import { Cache } from 'cache-manager';
import { socketConfig } from 'src/configs/socket.config';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { StatusId } from '../types/status.type';

@Injectable()
export class PlayerService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Update player's status to online.
   *
   * @param playerId player'id.
   * @param socketId connected socket's id.
   */
  async makeOnline(playerId: number, socketId: string) {
    await this.cacheManager.set(
      `${socketConfig.cacheKeys.SOCKET_ID_MAP_ID}${socketId}`,
      playerId,
    );
    await this.cacheManager.set(
      `${socketConfig.cacheKeys.ID_MAP_SOCKET_ID}${playerId}`,
      socketId,
    );

    return this.prismaService.player.update({
      select: {
        id: true,
        username: true,
        state: {
          select: {
            socket_id: true,
            latest_match_joined_at: true,
            status: true,
          },
        },
      },
      where: {
        id: playerId,
      },
      data: {
        state: {
          update: {
            socket_id: socketId,
            status_id: StatusId.ONLINE,
          },
        },
      },
    });
  }

  /**
   * Update player's status to offline.
   *
   * @param socketId connected socket's id.
   */
  async makeOffline(socketId: string) {
    const id = await this.cacheManager.get(
      `${socketConfig.cacheKeys.SOCKET_ID_MAP_ID}${socketId}`,
    );

    await this.cacheManager.del(
      `${socketConfig.cacheKeys.SOCKET_ID_MAP_ID}${socketId}`,
    );
    await this.cacheManager.del(
      `${socketConfig.cacheKeys.ID_MAP_SOCKET_ID}${id}`,
    );

    return this.prismaService.playerState.update({
      select: {
        player_id: true,
      },
      where: {
        socket_id: socketId,
      },
      data: {
        status_id: StatusId.OFFLINE,
        socket_id: null,
      },
    });
  }

  /**
   * Get all player's online friends.
   *
   * @param playerId player's id.
   */
  async getOnlineFriends(playerId: number) {
    const result = await this.prismaService.player.findUnique({
      select: {
        first_player_in_relationships: {
          select: {
            second_player: {
              select: {
                id: true,
                username: true,
                state: true,
              },
            },
          },
          where: {
            second_player: {
              state: {
                status_id: StatusId.ONLINE,
              },
            },
          },
        },
        second_player_in_relationships: {
          select: {
            frist_player: {
              select: {
                id: true,
                username: true,
                state: true,
              },
            },
          },
          where: {
            frist_player: {
              state: {
                status_id: StatusId.ONLINE,
              },
            },
          },
        },
      },
      where: {
        id: playerId,
      },
    });

    return this.convertToPlayerList(result);
  }

  /**
   * Get all the player's friends.
   *
   * @param playerId player's id.
   */
  async getFriendList(playerId: number) {
    const result = await this.prismaService.player.findUnique({
      select: {
        first_player_in_relationships: {
          select: {
            second_player: {
              select: {
                id: true,
                username: true,
                state: true,
              },
            },
          },
        },
        second_player_in_relationships: {
          select: {
            frist_player: {
              select: {
                id: true,
                username: true,
                state: true,
              },
            },
          },
        },
      },
      where: {
        id: playerId,
      },
    });

    return this.convertToPlayerList(result);
  }

  /**
   * Convert input to player array.
   *
   * @param data output of function `getFriendList` or `getOnlineFriends`.
   */
  private convertToPlayerList(data: {
    first_player_in_relationships: {
      second_player: Partial<Player> & { state: PlayerState };
    }[];
    second_player_in_relationships: {
      frist_player: Partial<Player> & { state: PlayerState };
    }[];
  }) {
    return data.first_player_in_relationships
      .map((f) => f.second_player)
      .concat(data.second_player_in_relationships.map((f) => f.frist_player));
  }
}
