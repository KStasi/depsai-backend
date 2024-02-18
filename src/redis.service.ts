import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { RedisStore } from 'cache-manager-redis-store';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  private readonly redisStore!: RedisStore;
  private readonly client: RedisClientType;
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {
    this.redisStore = cache.store as unknown as RedisStore;
    this.client = this.redisStore.getClient();
  }

  async get<T extends object | string>(key: string): Promise<T | undefined> {
    const value = await this.client.get(key);
    try {
      if (!value) {
        return undefined;
      }

      return JSON.parse(value);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return value as T;
      }
    }
  }

  async getAll<T extends object | string>(pattern: string): Promise<T[]> {
    const value = await this.client.keys(pattern);
    try {
      if (!value) {
        return undefined;
      }

      return value as T[];
    } catch (error) {
      if (error instanceof SyntaxError) {
        return value as T[];
      }
    }
  }

  async set<T extends object | string>(key: string, value: T) {
    const stringValue = JSON.stringify(value);

    return await this.client.set(key, stringValue);
  }

  async delete(key: string) {
    return await this.client.del(key);
  }
}
