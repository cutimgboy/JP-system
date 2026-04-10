import * as fs from 'fs';
import * as path from 'path';

const isProd = process.env.NODE_ENV === 'production';

function resolveEnvFiles() {
  const localEnv = path.resolve('.env.dev');
  const prodEnv = path.resolve('.env.prod');
  const candidates = isProd ? [prodEnv, localEnv] : [localEnv, prodEnv];
  const envFilePath = candidates.filter(filePath => fs.existsSync(filePath));

  return {
    envFilePath,
    ignoreEnvFile: envFilePath.length === 0,
  };
}

export default resolveEnvFiles();
