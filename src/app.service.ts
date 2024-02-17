import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { DeployParams } from './types';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  async getHello(data: object): Promise<string> {
    const oldData = await this.redisService.get('test');
    await this.redisService.set('test', data);
    return `Hello World! ${JSON.stringify(oldData)}`;
  }

  async deploy(params: DeployParams): Promise<string> {
    const image = params.image;
    return 'Hello World!';
  }
}
