import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { DeployParams, GetPaymentAddressParams } from './types';
import { MnemonicService } from './mnemonic.service';
import { EncryptionService } from './encryption.service';
import { ImageService } from './image.service';

@Injectable()
export class AppService {
  constructor(
    private readonly redisService: RedisService,
    private readonly mnemonicService: MnemonicService,
    private readonly encryptionService: EncryptionService,
    private readonly imageService: ImageService,
  ) {}

  async getHello(): Promise<string> {
    return `Hello World!`;
  }

  async deploy(params: DeployParams): Promise<string> {
    const image = params.image;
    const dockerFileName =
      await this.imageService.createDockerfileForGolem(image);
    const imageName =
      await this.imageService.buildImageForGolem(dockerFileName);
    await this.imageService.removeTmpDokerfile(dockerFileName);
    return imageName;
  }

  async getAddress(params: GetPaymentAddressParams): Promise<string> {
    const user = params.user;

    const storedAddress: string = await this.redisService.get(`pa-${user}`);
    if (storedAddress) {
      return storedAddress;
    }

    const phrase = await this.mnemonicService.generateSeedPhrase();
    const wallet = this.mnemonicService.createWallet(phrase);
    const paymentAddress = wallet.address;

    await this.redisService.set(
      `ph-${user}`,
      this.encryptionService.encrypt(phrase),
    );
    await this.redisService.set(`pa-${user}`, paymentAddress);
    return paymentAddress;
  }
}
