// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { method, url, body } = req;
    const now = Date.now();

    return next.handle().pipe(
      tap(
        void (async (data) => {
          const duration = Date.now() - now;
          const timestamp = new Date().toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
          });
          const date = new Date()
            .toLocaleDateString('ko-KR', {
              timeZone: 'Asia/Seoul',
            })
            .replace(/\. /g, '-')
            .replace('.', ''); // YYYY-MM-DD 형식

          const logFileName = `api_${date}.log`;
          const logPath = path.join(__dirname, '../../logs', logFileName);

          const log = `[${timestamp}] ${method} ${url} | ${duration}ms | body: ${JSON.stringify(body)} | response: ${JSON.stringify(data)}\n`;

          await fs.appendFile(logPath, log, 'utf8');

          console.log(log.trim()); // optional: 콘솔에도 찍기
        })(),
      ),
    );
  }
}
