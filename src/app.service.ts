import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  async getHello(data: object): Promise<string> {
    const oldData = await this.redisService.get('test');
    await this.redisService.set('test', data);
    return `Hello World! ${JSON.stringify(oldData)}`;
  }
}
