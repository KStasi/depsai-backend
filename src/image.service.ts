import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'node:path';
import * as util from 'node:util';

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
    const dockerFilePath = path.join(
      __dirname,
      '../tmp',
      `${dockerFileName}.tmp`,
    );

    const { stderr, stdout } = await execFilePromise(
      `sh ${scriptPath} ${imageName} ${dockerFilePath}`,
    );

    console.log('stdout:', stdout);
    console.log('stderr:', stderr);

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

    const { stdout } = await execFilePromise(
      `sh ${scriptPath} ${baseImage} ${dockerFileName}`,
    );

    console.log('stdout:', stdout);

    return dockerFileName;
  }
}
