import { Injectable } from '@nestjs/common';
import { Player, PlayerState, PlayerStatus } from '@prisma/client';
import { Socket } from 'socket.io';
import { CacheService } from 'src/modules/cache/cache.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { StatusId } from 'src/types/status.type';

@Injectable()
export class PlayerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Update player's status to online.
   *
   * @param playerId player'id.
   * @param socketId connected socket's id.
   */
  async makeOnline(playerId: number, socketId: string) {
    await this.cacheService.addPlayer(socketId, playerId);

    return this.prismaService.player.update({
      select: {
        id: true,
        username: true,
        state: {
          select: {
            status: {
              select: {
                name: true,
              },
            },
            latest_match_joined_at: true,
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
    const status = await this.cacheService.removePlayer(socketId);

    if (!status) {
      return { player_id: null };
    }

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
   * Add the player to the specific room.
   *
   * @param socket connected socket.
   * @param roomId room's id.
   */
  async joinRoom(
    socket: Socket,
    roomId: string,
  ): Promise<{ id: number; username: string }> {
    await this.cacheService.addPlayerToRoom(socket.id, roomId);

    const playerState = await this.prismaService.playerState.update({
      select: {
        player: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      where: {
        socket_id: socket.id,
      },
      data: {
        status_id: StatusId.IN_ROOM,
      },
    });

    socket.join(roomId);

    return playerState.player;
  }

  /**
   * Kick the player out of the current room.
   *
   * @param socket connected socket.
   * @param isOnline check if user disconnected or just leave the room.
   */
  async leaveCurrentRoom(socket: Socket, isOnline = true): Promise<any> {
    const roomId = await this.cacheService.getRoomOfPlayer(socket.id);

    if (!roomId) {
      throw new Error('You are not in a room!');
    }

    await this.cacheService.removePlayerFromRoom(socket.id);
    const playerState = await this.prismaService.playerState.update({
      select: {
        player: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      where: {
        socket_id: socket.id,
      },
      data: {
        status_id: isOnline ? StatusId.ONLINE : StatusId.OFFLINE,
      },
    });

    socket.leave(roomId);

    return {
      roomId,
      player: playerState.player,
    };
  }

  /**
   * Get all player's online friends.
   *
   * @param playerId player's id.
   */
  async getOnlineFriends(playerId: number) {
    return this.convertToPlayerList(
      await this.prismaService.player.findUnique({
        select: {
          first_player_in_relationships: {
            select: {
              second_player: {
                select: {
                  id: true,
                  username: true,
                  state: {
                    select: {
                      socket_id: true,
                    },
                  },
                },
              },
            },
            where: {
              second_player: {
                state: {
                  status_id: {
                    not: StatusId.OFFLINE,
                  },
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
                  state: {
                    select: {
                      socket_id: true,
                    },
                  },
                },
              },
            },
            where: {
              frist_player: {
                state: {
                  status_id: {
                    not: StatusId.OFFLINE,
                  },
                },
              },
            },
          },
        },
        where: {
          id: playerId,
        },
      }),
    );
  }

  /**
   * Get all the player's friends.
   *
   * @param playerId player's id.
   */
  async getFriendList(playerId: number) {
    return this.convertToPlayerList(
      await this.prismaService.player.findUnique({
        select: {
          first_player_in_relationships: {
            select: {
              second_player: {
                select: {
                  id: true,
                  username: true,
                  state: {
                    select: {
                      status: {
                        select: {
                          name: true,
                        },
                      },
                      socket_id: true,
                      latest_match_joined_at: true,
                    },
                  },
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
                  state: {
                    select: {
                      status: {
                        select: {
                          name: true,
                        },
                      },
                      socket_id: true,
                      latest_match_joined_at: true,
                    },
                  },
                },
              },
            },
          },
        },
        where: {
          id: playerId,
        },
      }),
    );
  }

  /**
   * Convert input to player array.
   *
   * @param data output of function `getFriendList` or `getOnlineFriends`.
   */
  private convertToPlayerList(data: {
    first_player_in_relationships: {
      second_player: Partial<Player> & {
        state: Partial<PlayerState> & { status?: Partial<PlayerStatus> };
      };
    }[];
    second_player_in_relationships: {
      frist_player: Partial<Player> & {
        state: Partial<PlayerState> & { status?: Partial<PlayerStatus> };
      };
    }[];
  }) {
    return data.first_player_in_relationships
      .map((f) => f.second_player)
      .concat(data.second_player_in_relationships.map((f) => f.frist_player));
  }

  /**
   * Check if two players are friends.
   *
   * @param playerId player's id.
   * @param friendId friend's id.
   */
  async areFriends(playerId: number, friendId: number): Promise<boolean> {
    const relationship = await this.prismaService.friendRelationship.findFirst({
      select: {
        id: true,
      },
      where: {
        OR: [
          { first_player_id: playerId, second_player_id: friendId },
          { first_player_id: playerId, second_player_id: friendId },
        ],
      },
    });

    return Number.isInteger(relationship?.id);
  }

  /**
   * Get players by their socket ids.
   *
   * @param socketIds list of socket ids.
   */
  getPlayersBySocketIds(socketIds: string[]) {
    return this.prismaService.player.findMany({
      select: {
        id: true,
        username: true,
        state: {
          select: {
            socket_id: true,
          },
        },
      },
      where: {
        state: {
          socket_id: {
            in: socketIds,
          },
        },
      },
    });
  }
}
