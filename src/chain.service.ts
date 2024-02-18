import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

@Injectable()
export class ChainService {
  public provider;
  constructor(private readonly configService: ConfigService) {
    this.provider = ethers.getDefaultProvider(configService.get<string>('NETWORK')!);
  }

  async getBalance(address: string, asset: string): Promise<string> {
    // TODO: convert with decimals
    if (asset === 'ETH') {
      const balance = await this.provider.getBalance(address);
      return balance.toString();
    }
    const contractABI = ['function balanceOf(address owner) view returns (uint256)'];
    const contract = new ethers.Contract(asset, contractABI, this.provider);
    const balance = await contract.balanceOf(address);
    return balance.toString();
  }

  async transfer(key: string, to: string, asset: string, amount: bigint): Promise<string> {
    const wallet = new ethers.Wallet(key, this.provider);
    let tx;
    if (asset.toLocaleUpperCase() === 'ETH') {
      tx = await wallet.sendTransaction({
        to,
        value: amount,
      });
    } else {
      const contractABI = ['function transfer(address to, uint256 value) returns (bool)'];
      const contract = new ethers.Contract(asset, contractABI, wallet);
      tx = await contract.transfer(to, amount);
    }
    return tx.hash;
  }
}
