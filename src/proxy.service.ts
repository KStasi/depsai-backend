import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as path from 'path';
import { ChildConfig, DeployConfig } from './types';

const [node, pathToFile] = process.argv;
const executorPath = path.join(pathToFile, '../../executor/executor.mjs');
console.log('node', node);
console.log('pathToFile', pathToFile);
console.log('executorPath', executorPath);

@Injectable()
export class ProxyService {
  childMap = new Map<string, ChildProcessWithoutNullStreams>();
  portMap = new Map<string, number>();
  startChildPort = 6500;
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

  prepareConfig(config: DeployConfig): ChildConfig {
    return {
      PORT: `${this.startChildPort + this.currentChildId}`,
      YAGNA_APPKEY: process.env.YAGNA_AUTOCONF_APPKEY,
      RUN_COMMAND: config.command,
      PACKAGE: config.package,
      USER_PORT: config.port,
      MIN_MEM_GIB: config.minMemGib,
      MIN_STORAGE_GIB: config.minStorageGib,
      MIN_CPU_THREADS: config.minCpuThreads,
      MIN_CPU_CORES: config.minCpuCores,
      BUDGET: config.budget,
    };
  }

  async createChild(config: DeployConfig) {
    const childPort = this.startChildPort + this.currentChildId;
    //node --loader ts-node/esm executor/executor.ts

    const env = this.prepareConfig(config);

    console.log('env', env);

    const child = spawn(node, [/*'--loader', 'ts-node/esm'*/ executorPath], {
      env: {
        ...process.env,
        ...env,
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
