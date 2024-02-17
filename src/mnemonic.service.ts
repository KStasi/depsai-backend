import { Injectable } from '@nestjs/common';
import { Mnemonic, ethers } from 'ethers';

@Injectable()
export class MnemonicService {
  async generateSeedPhrase() {
    try {
      const phrase = Mnemonic.entropyToPhrase(ethers.randomBytes(16));

      return phrase;
    } catch (error) {
      console.error('Error generating mnemonic:', error);
    }
  }

  createWallet(phrase: string) {
    try {
      const mnemonic = Mnemonic.fromPhrase(phrase);

      const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic);

      return wallet;
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  }
}
