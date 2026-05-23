import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { UserEntity } from '../src/user/entities/user.entity';
import { UserAccountEntity, AccountType } from '../src/user/entities/user-account.entity';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const envFileCandidates = [
  path.join(__dirname, '../.env.prod'),
  path.join(__dirname, '../.env.dev'),
];
const envFilePath = envFileCandidates.find(filePath => fs.existsSync(filePath));

if (envFilePath) {
  dotenv.config({ path: envFilePath });
}

async function createAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminPhone = process.env.ADMIN_PHONE || null;
  const adminEmail = process.env.ADMIN_EMAIL || null;

  if (!adminPassword || adminPassword.length < 12) {
    throw new Error('请通过 ADMIN_PASSWORD 配置至少 12 位的管理员初始密码');
  }

  // 创建数据库连接
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWD || '',
    database: process.env.DB_DATABASE || 'jp_system',
    entities: [UserEntity, UserAccountEntity],
    synchronize: true, // 自动同步数据库结构
  });

  try {
    await dataSource.initialize();
    console.log('数据库连接成功');

    const userRepository = dataSource.getRepository(UserEntity);
    const accountRepository = dataSource.getRepository(UserAccountEntity);

    // 检查管理员是否已存在
    const existingAdmin = await userRepository.findOne({
      where: { username: adminUsername },
    });

    if (existingAdmin) {
      console.log('管理员账户已存在');
      console.log(`用户名: ${adminUsername}`);
      console.log('如需重置密码，请先删除现有管理员账户');
      await dataSource.destroy();
      return;
    }

    // 生成密码哈希
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 创建管理员用户
    const admin = new UserEntity();
    admin.username = adminUsername;
    admin.password = hashedPassword;
    admin.phone = adminPhone;
    admin.email = adminEmail;
    admin.role = 'admin';
    admin.status = 1;

    const savedAdmin = await userRepository.save(admin);
    console.log('管理员用户创建成功，ID:', savedAdmin.id);

    // 创建模拟账户
    const demoAccount = new UserAccountEntity();
    demoAccount.userId = savedAdmin.id;
    demoAccount.accountType = AccountType.DEMO;
    demoAccount.balance = 1000000;
    demoAccount.frozenBalance = 0;
    await accountRepository.save(demoAccount);
    console.log('模拟账户创建成功');

    // 创建真实账户
    const realAccount = new UserAccountEntity();
    realAccount.userId = savedAdmin.id;
    realAccount.accountType = AccountType.REAL;
    realAccount.balance = 0;
    realAccount.frozenBalance = 0;
    await accountRepository.save(realAccount);
    console.log('真实账户创建成功');

    console.log('\n=================================');
    console.log('管理员账户创建成功！');
    console.log('=================================');
    console.log(`用户名: ${adminUsername}`);
    console.log('密码已从 ADMIN_PASSWORD 读取，不会输出到日志');
    console.log('=================================\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('创建管理员账户失败:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

createAdmin();
