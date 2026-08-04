import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';

@Injectable()
export class OAuthTokenVaultService {
  constructor(private readonly configService: ConfigService) {}

  encrypt(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key(), iv);
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return [iv, tag, encrypted]
      .map((part) => part.toString('base64url'))
      .join('.');
  }

  decrypt(secret: string): string {
    const [iv, tag, encrypted] = secret
      .split('.')
      .map((part) => Buffer.from(part, 'base64url'));

    if (!iv || !tag || !encrypted) {
      throw new ServiceUnavailableException('Stored OAuth token is invalid.');
    }

    const decipher = createDecipheriv('aes-256-gcm', this.key(), iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  }

  private key(): Buffer {
    const secret =
      this.configService.get<string>('OAUTH_TOKEN_ENCRYPTION_SECRET') ??
      this.configService.get<string>('AUTH_OAUTH_STATE_SECRET') ??
      this.configService.get<string>('GITHUB_CLIENT_SECRET');

    if (!secret) {
      throw new ServiceUnavailableException(
        'OAuth token encryption secret is not configured.',
      );
    }

    return createHash('sha256').update(secret).digest();
  }
}
