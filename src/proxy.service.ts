import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as path from 'path';

const [node, pathToFile] = process.argv;
const executorPath = path.join(pathToFile, '../../executor/executor.mjs');
console.log('node', node);
console.log('pathToFile', pathToFile);
console.log('executorPath', executorPath);

@Injectable()
export class ProxyService {
  childMap = new Map<string, ChildProcessWithoutNullStreams>();
  portMap = new Map<string, number>();
  startChildPort = 7000;
  currentChildId = 0;

  domain: string;
  port: string;

  constructor(private readonly configService: ConfigService) {
    this.domain = this.configService.get<string>('DOMAIN');
    this.port = this.configService.get<string>('PORT');

    process.on('SIGINT', () => {
      console.log('SIGINT');
      this.childMap.forEach((child) => {
        child.kill();
      });
    });
  }

  registerChild(
    networkId: string,
    port: number,
    child: ChildProcessWithoutNullStreams,
  ) {
    this.childMap.set(networkId, child);
    this.portMap.set(networkId, port);

    child.on('exit', () => {
      this.childMap.delete(networkId);
      this.portMap.delete(networkId);
    });
  }

  async createChild() {
    const childPort = this.startChildPort + this.currentChildId;
    //node --loader ts-node/esm executor/executor.ts

    const child = spawn(node, [/*'--loader', 'ts-node/esm'*/ executorPath], {
      env: {
        ...process.env,
        PORT: `${childPort}`,
        YAGNA_APPKEY: process.env.YAGNA_AUTOCONF_APPKEY,
        USER_PORT: '7878',
        RUN_COMMAND: 'npm run start',
        PACKAGE: 'd7f78a202dd00ce8d979db5d1a31388d408d989f9fd2cc8596c43517',
      },
      detached: true,
      stdio: ['ignore'],
    });

    const networkId = await new Promise<string>((resolve, reject) => {
      child.stdout!.on('data', (data) => {
        console.log(`FROM_CHILD > ${childPort}`, data.toString());
        const match = data.toString().match(/id: (.+)/);

        console.log('match', match);

        if (data.toString() === 'shutting down') {
          console.log('shutting down');
        }

        if (match) {
          resolve(match[1]);
        }
      });

      child.stderr!.on('data', (data) => {
        if (data.toString().includes('ExperimentalWarning')) {
          return;
        }
        console.log('FOUND ERROR', data.toString());

        reject(data.toString());
      });
    });

    this.registerChild(networkId, childPort, child);

    this.currentChildId++;

    return {
      link: this.formatUserLink(networkId),
    };
  }

  formatUserLink(networkId: string) {
    if (this.domain === 'localhost') {
      return `http://${networkId}.${this.domain}:${this.port}`;
    } else {
      return `https://${networkId}.${this.domain}`;
    }
  }
}
