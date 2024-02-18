import { TaskExecutor } from '@golem-sdk/golem-js';
import { Server } from 'node:net';
import { WebSocket } from 'ws';
import { z } from 'zod';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import dotenv from 'dotenv';
console.log('dotenv', dotenv);
dotenv.config();

// export interface ProxyOptions extends ServerOpts {
//   yagnaOptions?: YagnaOptions;
// }

// type RemoteProcess = Awaited<ReturnType<WorkContext['spawn']>>;

// type CreateProxy = {
//   (
//     wsUrl: string,
//     apiKey: string,
//   ): (remoteProcess: RemoteProcess) => Promise<void>;
//   proxy?: ProxyServer;
// };

export class ProxyServer extends Server {
  constructor(wsUrl, apiKey) {
    super();
    this.on('connection', (socket) => {
      const ws = new WebSocket(wsUrl, {
        headers: { authorization: `Bearer ${apiKey}` },
      });
      ws.on('open', () =>
        socket.on('data', (chunk) => ws.send(chunk.toString())),
      );
      ws.on('message', (message) => socket.write(message.toString()));
      ws.on('end', () => socket.end());
      ws.on('error', (error) =>
        this.emit('error', `WebSocket Error: ${error}`),
      );
      socket.on('error', (error) => this.emit('error', error));
      socket.on('close', () => ws.close());
    });
  }
}

const numberAsString = z
  .string()
  .refine((x) => x && !isNaN(Number(x)), { message: 'Must be a number' });

const optionalNumberAsString = numberAsString
  .optional()
  .transform((value) => value && Number(value));

const envSchema = z.object({
  YAGNA_APPKEY: z.string(),
  PORT: z.string(),
  USER_PORT: numberAsString.transform(Number),
  RUN_COMMAND: z.string(),
  PACKAGE: z.string(),
  MIN_MEM_GIB: optionalNumberAsString,
  MIN_STORAGE_GIB: optionalNumberAsString,
  MIN_CPU_THREADS: optionalNumberAsString,
  MIN_CPU_CORES: optionalNumberAsString,
  BUDGET: optionalNumberAsString,
});

const {
  YAGNA_APPKEY,
  PORT,
  USER_PORT,
  RUN_COMMAND,
  PACKAGE,
  MIN_MEM_GIB,
  MIN_STORAGE_GIB,
  MIN_CPU_THREADS,
  MIN_CPU_CORES,
  BUDGET,
} = envSchema.parse(process.env);

const createProxy = (wsUrl, apiKey) => {
  if (createProxy.proxy) {
    createProxy.proxy.close();
  }
  createProxy.proxy = new ProxyServer(wsUrl, apiKey);
  createProxy.proxy.on('error', (error) =>
    console.error('Proxy Error:', error),
  );
  return (remoteProcess) => {
    remoteProcess.stdout
      .once('data', () =>
        createProxy.proxy.listen(PORT, () =>
          console.log(
            `reqestor> Server Proxy listen at http://localhost:${PORT}`,
          ),
        ),
      )
      .on('data', (data) => console.log('provider>', data));
    return new Promise((res) =>
      process.once('SIGINT', () => res(void createProxy.proxy.close())),
    );
  };
};

const extractId = (websocketUri) => {
  const match = websocketUri.match(/\/net\/([^/]+)\/tcp/);
  if (!match) throw new Error('Invalid websocketUri');
  return match[1];
};
(async () => {
  const executor = await TaskExecutor.create({
    package: PACKAGE,
    yagnaOptions: { apiKey: YAGNA_APPKEY },
    networkIp: '192.168.0.0/24',
    capabilities: ['vpn'],
    minMemGib: MIN_MEM_GIB,
    minStorageGib: MIN_STORAGE_GIB,
    minCpuThreads: MIN_CPU_THREADS,
    minCpuCores: MIN_CPU_CORES,
    budget: BUDGET,
  });

  console.log('executor created');
  try {
    await executor.run(async (ctx) => {
      const remoteProcess = await ctx.spawn(RUN_COMMAND);
      const url = ctx.getWebsocketUri(Number(USER_PORT));

      console.log('id:', extractId(url));

      const closeProxy = createProxy(url, YAGNA_APPKEY);

      return await closeProxy(remoteProcess);
    });
  } catch (error) {
    console.log('ERROR', error);
  } finally {
    console.log('shutting down');
    await executor.shutdown();
  }
})().catch(console.error);
process.on('SIGINT', () => process.exit(0));
