import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { service: string; status: string } {
    return { service: 'visual-pipeline-deploy-agent', status: 'ok' };
  }
}
