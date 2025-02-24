import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

@Injectable()
export class VerificationService {
  constructor(private readonly configService: ConfigService) {}

  private readonly tokenMap = new Map<
    string,
    { userId: number; expiresAt: Date }
  >();

  getVerificationUrl(token: string) {
    const baseUrl = this.configService.get('APP_URL', 'http://localhost:3000');
    return `${baseUrl}/auth/verify/${token}`;
  }

  generateToken(userId: number) {
    const token = nanoid(8);
    const expiresAt = new Date();

    expiresAt.setMinutes(expiresAt.getMinutes() + 1); // 1 minutes expiration

    this.tokenMap.set(token, { userId, expiresAt });

    return token;
  }

  validateToken(token: string) {
    const record = this.tokenMap.get(token);

    if (!record) return null;

    if (new Date() > record.expiresAt) {
      this.tokenMap.delete(token);
      return null;
    }

    this.tokenMap.delete(token);

    return record.userId;
  }
}
