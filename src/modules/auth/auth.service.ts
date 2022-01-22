import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Verify player's token. Return 0 if failed.
   *
   * @param bearerToken token authentication.
   */
  async verify(bearerToken: string) {
    if (bearerToken === '') {
      return 0;
    }

    const [key, plainTextToken] = this.parseToken(bearerToken);

    const playerId = Number(key);

    // Failed if key or plain text token don't exist
    if (Number.isNaN(playerId) || plainTextToken === undefined) {
      return 0;
    }

    const token = await this.prismaService.personalAccessToken.findFirst({
      select: {
        tokenable_id: true,
      },
      where: {
        tokenable_id: playerId,
        // Hash plain text token then compare with hased token in database
        token: createHash('sha256').update(plainTextToken).digest('hex'),
      },
    });

    return token?.tokenable_id === playerId ? playerId : 0;
  }

  /**
   * Parse key and plain text token from bearer token.
   *
   * @param bearerToken token authentication.
   */
  parseToken(bearerToken: string) {
    return bearerToken.replace('Bearer ', '').split('|');
  }
}
