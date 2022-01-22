import { Injectable } from '@nestjs/common';
import { Player, PlayerState } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { StatusId } from '../types/status.type';

@Injectable()
export class PlayerService {
  constructor(private readonly prismaService: PrismaService) {}

  makeOnline(playerId: number, socketId: string) {
    return this.prismaService.player.update({
      select: {
        id: true,
        username: true,
        state: {
          select: {
            socket_id: true,
            status_updated_at: true,
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

  makeOffline(socketId: string) {
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
