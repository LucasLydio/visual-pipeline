import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

@Injectable()
export class GithubSignatureService {
  constructor(private readonly configService: ConfigService) {}

  assertValid(
    rawBody: Buffer | undefined,
    signature: string | undefined,
  ): void {
    const secret = this.configService.get<string>('GITHUB_WEBHOOK_SECRET');

    if (!secret) {
      throw new ServiceUnavailableException(
        'GitHub webhook secret is not configured.',
      );
    }

    if (!rawBody?.length || !signature?.startsWith('sha256=')) {
      throw new UnauthorizedException('Invalid GitHub webhook signature.');
    }

    const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      throw new UnauthorizedException('Invalid GitHub webhook signature.');
    }
  }
}
