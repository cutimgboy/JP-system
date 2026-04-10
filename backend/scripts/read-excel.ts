import * as XLSX from 'xlsx';
import { resolveDataFile } from './utils/resolve-data-file';

// 读取 Excel 文件
const filePath = resolveDataFile('CFD品种信息表.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('Sheet Names:', workbook.SheetNames);

// 读取"品种交易设置" sheet
const sheetName = '品种交易设置';
if (workbook.SheetNames.includes(sheetName)) {
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log('\n总记录数:', data.length);
  console.log('\n前3条数据:');
  console.log(JSON.stringify(data.slice(0, 3), null, 2));

  // 打印所有列名
  if (data.length > 0) {
    console.log('\n所有列名:');
    console.log(Object.keys(data[0] as any));
  }
} else {
  console.log(`未找到 "${sheetName}" sheet`);
}
