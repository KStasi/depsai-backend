import { exec } from 'child_process';
const path = require('node:path');
const util = require('node:util');

const execFilePromise = util.promisify(exec);
const generateRandomDockerFileName = (): string =>
  `Dockerfile-${Math.random().toString(36).substring(7)}`;

export const buildImageForGolem = async (
  baseImage: string,
): Promise<string> => {
  const dockerFileName = generateRandomDockerFileName();
  const scriptPath = path.join(
    __dirname,
    '../../scripts',
    'create-tmp-docker-file.sh',
  );

  console.log(scriptPath);
  console.log(dockerFileName);

  const { stderr, stdout } = await execFilePromise(
    `sh ${scriptPath} ${baseImage} ${dockerFileName}`,
  );

  return dockerFileName;
};
