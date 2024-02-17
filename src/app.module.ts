import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule, CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { RedisService } from './redis.service';
import { MnemonicService } from './mnemonic.service';
import { EncryptionService } from './encryption.service';
import { ImageService } from './image.service';
import { ChainService } from './chain.service';

export const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const store = await redisStore({
      socket: {
        host: configService.get<string>('REDIS_HOST'),
        port: parseInt(configService.get<string>('REDIS_PORT')!),
      },
    });
    return {
      store: () => store,
    };
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync(RedisOptions),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisService,
    MnemonicService,
    EncryptionService,
    ImageService,
    ChainService,
  ],
})
export class AppModule {}
