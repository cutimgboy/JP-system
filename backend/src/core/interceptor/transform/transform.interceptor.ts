import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

interface ApiEnvelope<T = unknown> {
  code: number;
  data: T;
  msg: string;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isLegacyEnvelope(
    value: unknown,
  ): value is { code?: number; data: unknown; msg?: string; message?: string } {
    return this.isRecord(value) && 'data' in value && ('code' in value || 'msg' in value || 'message' in value);
  }

  private isSuccessEnvelope(
    value: unknown,
  ): value is { success: boolean; data: unknown; message?: string } {
    return this.isRecord(value) && 'success' in value && 'data' in value;
  }

  private normalizeResponse<T>(data: T): ApiEnvelope {
    if (this.isLegacyEnvelope(data)) {
      return {
        data: data.data,
        code: typeof data.code === 'number' ? data.code : 0,
        msg:
          typeof data.msg === 'string'
            ? data.msg
            : typeof data.message === 'string'
              ? data.message
              : '请求成功',
      };
    }

    if (this.isSuccessEnvelope(data)) {
      return {
        data: data.data,
        code: data.success ? 0 : -1,
        msg:
          typeof data.message === 'string'
            ? data.message
            : data.success
              ? '请求成功'
              : '请求失败',
      };
    }

    return {
      data,
      code: 0,
      msg: '请求成功',
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.normalizeResponse(data)),
    );
  }
}
