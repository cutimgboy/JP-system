import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class SmsService {
  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  private getFixedCode(): string | null {
    const enabled = this.configService.get<string>('ENABLE_FIXED_SMS_CODE', 'true');

    if (enabled !== 'true') {
      return null;
    }

    return this.configService.get<string>('FIXED_SMS_CODE', '123456');
  }

  /**
   * 生成6位随机验证码
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 发送短信验证码
   * @param phone 手机号
   */
  async sendSms(phone: string): Promise<string> {
    const fixedCode = this.getFixedCode();

    if (fixedCode) {
      return fixedCode;
    }

    const cacheKey = `sms:${phone}`;
    const existingCode = await this.redisService.get(cacheKey);

    if (existingCode) {
      throw new BadRequestException('验证码已发送，请稍后再试');
    }

    const code = this.generateCode();

    // TODO: 接入真实短信服务商。不要在接口响应或生产日志中暴露验证码。
    // await this.sendSmsToProvider(phone, code);

    await this.redisService.set(cacheKey, code, 300);
    return code;
  }

  /**
   * 验证短信验证码
   * @param phone 手机号
   * @param code 验证码
   */
  async verifySms(phone: string, code: string): Promise<boolean> {
    const fixedCode = this.getFixedCode();

    if (fixedCode && code === fixedCode) {
      return true;
    }

    const cacheKey = `sms:${phone}`;
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

  async assertSmsCode(phone: string, code: string): Promise<boolean> {
    const fixedCode = this.getFixedCode();

    if (fixedCode && code === fixedCode) {
      return true;
    }

    const cacheKey = `sms:${phone}`;
    const cachedCode = await this.redisService.get(cacheKey);

    if (!cachedCode) {
      throw new BadRequestException('验证码已过期或不存在');
    }

    if (cachedCode !== code) {
      throw new BadRequestException('验证码错误');
    }

    return true;
  }

  /**
   * 调用第三方短信服务商发送短信（示例）
   * 实际使用时需要替换为真实的短信服务商SDK
   */
  private async sendSmsToProvider(phone: string, code: string): Promise<void> {
    // 示例：阿里云短信服务
    // const client = new AliSmsClient(config);
    // await client.sendSms({
    //   phoneNumbers: phone,
    //   signName: '您的签名',
    //   templateCode: 'SMS_123456',
    //   templateParam: JSON.stringify({ code })
    // });
  }
}
