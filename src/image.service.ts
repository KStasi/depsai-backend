import { Injectable } from '@nestjs/common';
import { Mnemonic, ethers } from 'ethers';
import { exec } from 'child_process';
const fs = require('fs');
const path = require('node:path');
const util = require('node:util');

const execFilePromise = util.promisify(exec);
const generateRandomDockerFileName = (): string =>
  `Dockerfile-${Math.random().toString(36).substring(7)}`;

@Injectable()
export class ImageService {
  async buildImageForGolem(dockerFileName: string): Promise<string> {
    const imageName = `golem-${Math.random().toString(36).substring(7)}`;
    const scriptPath = path.join(
      __dirname,
      '../scripts',
      'build-image-for-golem.sh',
    );

    const { stderr, stdout } = await execFilePromise(
      `sh ${scriptPath} ${dockerFileName} ${imageName}`,
    );
    return imageName;
  }
  async removeTmpDokerfile(dockerFileName: string): Promise<void> {
    const filePath = path.join(__dirname, '../tmp', `${dockerFileName}.tmp`);
    fs.unlinkSync(filePath);
  }

  async createDockerfileForGolem(baseImage: string): Promise<string> {
    const dockerFileName = generateRandomDockerFileName();
    const scriptPath = path.join(
      __dirname,
      '../scripts',
      'create-tmp-docker-file.sh',
    );

    const { stderr, stdout } = await execFilePromise(
      `sh ${scriptPath} ${baseImage} ${dockerFileName}`,
    );

    console.log('stdout:', stdout);

    return dockerFileName;
  }
}
