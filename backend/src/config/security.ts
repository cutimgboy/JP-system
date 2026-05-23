import { ConfigService } from '@nestjs/config';

const DEVELOPMENT_JWT_SECRET = 'dev-only-change-me-at-least-32-characters';

export function isProduction(configService: ConfigService): boolean {
  return configService.get('NODE_ENV') === 'production';
}

export function getJwtSecret(configService: ConfigService): string {
  const configuredSecret = configService.get<string>('JWT_SECRET');

  if (configuredSecret && configuredSecret.length >= 32) {
    return configuredSecret;
  }

  if (isProduction(configService)) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }

  return DEVELOPMENT_JWT_SECRET;
}

export function getAllowedOrigins(configService: ConfigService): string[] {
  const configured = configService.get<string>('CORS_ORIGINS');

  if (configured) {
    return configured
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  if (isProduction(configService)) {
    return [];
  }

  return [
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5176',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5176',
  ];
}
