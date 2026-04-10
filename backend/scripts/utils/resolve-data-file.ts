import * as fs from 'fs';
import * as path from 'path';

export function resolveDataFile(fileName: string) {
  const candidates = [
    path.resolve(__dirname, '../../', fileName),
    path.resolve(__dirname, '../../../', fileName),
    path.resolve(process.cwd(), fileName),
  ];

  const resolvedPath = candidates.find(filePath => fs.existsSync(filePath));

  if (!resolvedPath) {
    throw new Error(`未找到数据文件: ${fileName}`);
  }

  return resolvedPath;
}
