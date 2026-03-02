import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { UserEntity } from '../src/user/entities/user.entity';
import { UserAccountEntity, AccountType } from '../src/user/entities/user-account.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.dev') });

/**
 * 创建管理员账户脚本
 * 用户名: admin
 * 密码: Admin@123456
 */
async function createAdmin() {
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
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      console.log('管理员账户已存在');
      console.log('用户名: admin');
      console.log('如需重置密码，请先删除现有管理员账户');
      await dataSource.destroy();
      return;
    }

    // 生成密码哈希
    const password = 'Admin@123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建管理员用户
    const admin = new UserEntity();
    admin.username = 'admin';
    admin.password = hashedPassword;
    admin.phone = '13800138000';
    admin.email = 'admin@jp-system.com';
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
    console.log('用户名: admin');
    console.log('密码: Admin@123456');
    console.log('=================================');
    console.log('请妥善保管管理员账户信息');
    console.log('=================================\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('创建管理员账户失败:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

createAdmin();
