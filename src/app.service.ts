import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { DeployParams } from './types';
import { MnemonicService } from './mnemonic.service';
import { buildImageForGolem } from './image-processors';

@Injectable()
export class AppService {
  constructor(
    private readonly redisService: RedisService,
    private readonly mnemonicService: MnemonicService,
  ) {}

  async getHello(): Promise<string> {
    const phrase = await this.mnemonicService.generateSeedPhrase();

    const wallet = this.mnemonicService.createWallet(phrase);

    const address = wallet.address;

    console.log(wallet);

    return `Hello World! ${address}`;
  }

  async deploy(params: DeployParams): Promise<string> {
    const image = params.image;
    const dockerFileName = await buildImageForGolem(image);
    // create dockerfile
    // build image
    // push to registry
    // remove tmp dockerfile
    return dockerFileName;
  }
}
