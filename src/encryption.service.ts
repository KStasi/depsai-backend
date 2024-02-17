import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Mnemonic, ethers } from 'ethers';
const crypto = require('crypto');
// import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const hexToBuffer = (hex: string) => Buffer.from(hex, 'hex');

@Injectable()
export class EncryptionService {
  constructor(private readonly configService: ConfigService) {}

  async encrypt(data: string): Promise<string> {
    const cipher = crypto.createCipheriv(
      algorithm,
      hexToBuffer(this.configService.get<string>('ENCRYPTION_KEY')),
      hexToBuffer(this.configService.get<string>('ENCRYPTION_IV')),
    );

    return Buffer.from(
      cipher.update(data, 'utf8', 'hex') + cipher.final('hex'),
    ).toString('base64');
  }

  async decrypt(encryptedData: string): Promise<string> {
    const buff = Buffer.from(encryptedData, 'base64');
    const decipher = crypto.createDecipheriv(
      algorithm,
      hexToBuffer(this.configService.get<string>('ENCRYPTION_KEY')),
      hexToBuffer(this.configService.get<string>('ENCRYPTION_IV')),
    );

    return (
      decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
      decipher.final('utf8')
    );
  }
}
