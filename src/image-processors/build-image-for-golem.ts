import { exec } from 'child_process';
const path = require('node:path');
const util = require('node:util');

const execFilePromise = util.promisify(exec);

export const buildImageForGolem = async (
  dockerFileName: string,
): Promise<string> => {
  const imageName = `golem-${Math.random().toString(36).substring(7)}`;
  const scriptPath = path.join(
    __dirname,
    '../../scripts',
    'build-image-for-golem.sh',
  );

  const { stderr, stdout } = await execFilePromise(
    `sh ${scriptPath} ${dockerFileName} ${imageName}`,
  );
  console.log(stderr);
  console.log(stdout);
  console.log('Image built:', imageName);
  return imageName;
};
