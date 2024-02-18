import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import {
  DeployParams,
  DeploymentDetails,
  GetPaymentAddressParams,
  WithdrawParams,
} from './types';
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
    const generatedId = Math.random().toString(36).substring(7);

    await this.updateDeployment({
      ...params,
      generatedId,
      package: '',
      link: '',
      status: 'deploying',
    });

    // image preparation:
    const image = params.image;
    const dockerFileName =
      await this.imageService.createDockerfileForGolem(image);
    const imageHash =
      await this.imageService.buildImageForGolem(dockerFileName);
    await this.imageService.removeTmpDokerfile(dockerFileName);

    await this.updateDeployment({
      ...params,
      generatedId,
      package: imageHash,
      link: '',
      status: 'image created',
    });

    // proxy creation:
    const config = {
      package: imageHash,
      ...params,
    };
    const response = await this.proxyService.createChild(config);

    await this.updateDeployment({
      ...params,
      generatedId,
      package: imageHash,
      link: response.link,
      status: 'deployed',
    });

    console.log('deployed', response.link);

    return response.link;
  }

  async updateDeployment(
    params: DeploymentDetails & { user: string },
  ): Promise<void> {
    const prevDeployments: DeploymentDetails[] = ((await this.redisService.get(
      `d-${params.user}`,
    )) || []) as DeploymentDetails[];

    const index = prevDeployments.findIndex(
      (d) => d.generatedId === params.generatedId,
    );
    if (index !== -1) {
      prevDeployments[index] = params;
    } else {
      prevDeployments.push(params);
    }

    await this.redisService.set(`d-${params.user}`, prevDeployments);
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

    await this.redisService.set(
      `ph-${user}`,
      await this.encryptionService.encrypt(phrase),
    );
    await this.redisService.set(`pa-${user}`, paymentAddress);
    return paymentAddress;
  }

  async deployments(
    params: GetPaymentAddressParams,
  ): Promise<DeploymentDetails[]> {
    const user = params.user;

    const prevDeployments = await this.redisService.get(`d-${user}`);
    if (prevDeployments) {
      return prevDeployments as DeploymentDetails[];
    }

    // create mock deployments
    const mockDeployments: DeploymentDetails[] = [
      {
        package: 'd7f78a202dd00ce8d979db5d1a31388d408d989f9fd2cc8596c43517',
        command: 'npm run start',
        port: '7878',
        link: 'http://localhost:7878',
        status: 'deployed',
      },
      {
        package: 'd7f78a202dd00ce8d979db5d1a31388d408d989f9fd2cc8596c43517',
        command: 'npm run start',
        port: '7878',
        link: 'http://localhost:7878',
        status: 'deployed',
      },
    ];
    return mockDeployments;
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
