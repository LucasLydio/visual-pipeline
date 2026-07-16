import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const PASSWORD_KEY_LENGTH = 64;
const TOKEN_BYTES = 48;

@Injectable()
export class PasswordService {
  async hashPassword(password: string): Promise<string> {
    this.assertPasswordStrength(password);

    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(
      password,
      salt,
      PASSWORD_KEY_LENGTH,
    )) as Buffer;

    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }

  async verifyPassword(
    password: string,
    storedHash?: string | null,
  ): Promise<boolean> {
    if (!storedHash) {
      return false;
    }

    const [algorithm, salt, key] = storedHash.split(':');

    if (algorithm !== 'scrypt' || !salt || !key) {
      return false;
    }

    const derivedKey = (await scryptAsync(
      password,
      salt,
      PASSWORD_KEY_LENGTH,
    )) as Buffer;
    const storedKey = Buffer.from(key, 'hex');

    if (storedKey.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(storedKey, derivedKey);
  }

  createOpaqueToken(): string {
    return randomBytes(TOKEN_BYTES).toString('base64url');
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  assertPasswordStrength(password?: string): void {
    if (!password || password.length < 8) {
      throw new BadRequestException(
        'Password must have at least 8 characters.',
      );
    }

    if (password.length > 128) {
      throw new BadRequestException(
        'Password must have at most 128 characters.',
      );
    }
  }
}
