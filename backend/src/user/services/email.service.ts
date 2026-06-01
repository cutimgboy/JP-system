import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  private getFixedCode(): string | null {
    const enabled = this.configService.get<string>('ENABLE_FIXED_EMAIL_CODE', 'true');

    if (enabled !== 'true') {
      return null;
    }

    return this.configService.get<string>('FIXED_EMAIL_CODE', '123456');
  }

  /**
   * 生成6位随机验证码
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  /**
   * 发送邮箱验证码
   * @param email 邮箱地址
   */
  async sendEmail(email: string): Promise<string> {
    const normalizedEmail = this.normalizeEmail(email);
    const fixedCode = this.getFixedCode();

    if (fixedCode) {
      return fixedCode;
    }

    // 检查是否频繁发送
    const cacheKey = `email:${normalizedEmail}`;
    const existingCode = await this.redisService.get(cacheKey);

    if (existingCode) {
      throw new BadRequestException('验证码已发送，请稍后再试');
    }

    // 生成验证码
    const code = this.generateCode();

    await this.sendEmailToProvider(normalizedEmail, code);

    // 将验证码存入缓存，有效期5分钟（300秒）
    await this.redisService.set(cacheKey, code, 300);
    return code;
  }

  /**
   * 验证邮箱验证码
   * @param email 邮箱地址
   * @param code 验证码
   */
  async verifyEmail(email: string, code: string): Promise<boolean> {
    const normalizedEmail = this.normalizeEmail(email);
    const fixedCode = this.getFixedCode();

    if (fixedCode && code === fixedCode) {
      return true;
    }

    const cacheKey = `email:${normalizedEmail}`;
    const cachedCode = await this.redisService.get(cacheKey);

    if (!cachedCode) {
      throw new BadRequestException('验证码已过期或不存在');
    }

    if (cachedCode !== code) {
      throw new BadRequestException('验证码错误');
    }

    // 验证成功后删除验证码
    await this.redisService.del(cacheKey);
    return true;
  }

  async assertEmailCode(email: string, code: string): Promise<boolean> {
    const normalizedEmail = this.normalizeEmail(email);
    const fixedCode = this.getFixedCode();

    if (fixedCode && code === fixedCode) {
      return true;
    }

    const cacheKey = `email:${normalizedEmail}`;
    const cachedCode = await this.redisService.get(cacheKey);

    if (!cachedCode) {
      throw new BadRequestException('验证码已过期或不存在');
    }

    if (cachedCode !== code) {
      throw new BadRequestException('验证码错误');
    }

    return true;
  }

  private async sendEmailToProvider(email: string, code: string): Promise<void> {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT', '587'));
    const secureConfig = this.configService.get<string>('SMTP_SECURE');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('SMTP_FROM') || user;
    const appName = this.configService.get<string>('APP_NAME', 'JMP Trading');
    const subject = this.configService.get<string>('EMAIL_CODE_SUBJECT', '登录验证码');

    if (!host || !from) {
      throw new BadRequestException('邮件服务未配置');
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number.isFinite(port) ? port : 587,
      secure: secureConfig !== undefined ? secureConfig === 'true' : port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });

    try {
      await transporter.sendMail({
        from,
        to: email,
        subject,
        text: `您的验证码是 ${code}，有效期5分钟。`,
        html: `<p>${appName} 登录验证码：<strong>${code}</strong></p><p>验证码有效期5分钟，请勿泄露给他人。</p>`,
      });
    } catch (error) {
      this.logger.error('Failed to send email verification code', error);
      throw new BadRequestException('邮件发送失败，请稍后再试');
    }
  }
}
