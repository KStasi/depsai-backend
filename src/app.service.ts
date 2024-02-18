import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ChildConfig, DeployParams, GetPaymentAddressParams, WithdrawParams } from './types';
import { MnemonicService } from './mnemonic.service';
import { EncryptionService } from './encryption.service';
import { ImageService } from './image.service';
import { ChainService } from './chain.service';
import { ethers } from 'ethers';
import { ProxyService } from './proxy.service';

@Injectable()
export class AppService {
  constructor(
    private readonly redisService: RedisService,
    private readonly mnemonicService: MnemonicService,
    private readonly encryptionService: EncryptionService,
    private readonly imageService: ImageService,
    private readonly chainService: ChainService,
    private readonly proxyService: ProxyService,
  ) {}

  async getHello(): Promise<string> {
    return `Hello World!`;
  }

  async deploy(params: DeployParams): Promise<string> {
    // TODO: check request signature

    // image preparation:
    const image = params.image;
    const dockerFileName = await this.imageService.createDockerfileForGolem(image);
    const imageHash = await this.imageService.buildImageForGolem(dockerFileName);
    await this.imageService.removeTmpDokerfile(dockerFileName);

    // proxy creation:
    const response = await this.proxyService.createChild({
      package: imageHash,
      ...params,
    });

    return response.link;
  }

  async deposit(params: GetPaymentAddressParams): Promise<string> {
    const user = params.user;

    const storedAddress: string = await this.redisService.get(`pa-${user}`);
    if (storedAddress) {
      return storedAddress;
    }

    const phrase = await this.mnemonicService.generateSeedPhrase();
    const wallet = this.mnemonicService.createWallet(phrase);
    const paymentAddress = wallet.address;

    await this.redisService.set(`ph-${user}`, await this.encryptionService.encrypt(phrase));
    await this.redisService.set(`pa-${user}`, paymentAddress);
    return paymentAddress;
  }

  async withdraw(params: WithdrawParams): Promise<string> {
    const user = params.user;
    // TODO: check request signature

    const storedWallet: string = await this.redisService.get(`ph-${user}`);
    if (!storedWallet) {
      throw new BadRequestException('account is empty');
    }

    const phrase = await this.encryptionService.decrypt(storedWallet);
    const wallet = this.mnemonicService.createWallet(phrase);
    return await this.chainService.transfer(
      wallet.signingKey.privateKey,
      user,
      params.asset,
      ethers.parseEther(params.amount),
    );
  }
}
