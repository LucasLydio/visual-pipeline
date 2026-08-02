import { Injectable } from '@nestjs/common';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

@Injectable()
export class WorkflowTokenService {
  generateToken(): string {
    return `vpwf_${randomBytes(32).toString('base64url')}`;
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  matches(token: string, hash: string | null): boolean {
    if (!hash) return false;
    const candidate = Buffer.from(this.hashToken(token), 'hex');
    const expected = Buffer.from(hash, 'hex');

    return (
      candidate.length === expected.length &&
      timingSafeEqual(candidate, expected)
    );
  }
}
