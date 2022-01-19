import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async verify(authorization: string) {
    const [key, plainTextToken] = this.parseToken(authorization);

    const playerId = Number(key);

    if (Number.isNaN(playerId) || plainTextToken === undefined) {
      return 0;
    }

    const token = await this.prismaService.personalAccessToken.findFirst({
      select: {
        id: true,
      },
      where: {
        tokenable_id: playerId,
        token: createHash('sha256').update(plainTextToken).digest('hex'),
      },
    });

    return token ? Number(playerId) : 0;
  }

  parseToken(authorization: string) {
    return authorization.replace('Bearer ', '').split('|');
  }
}
