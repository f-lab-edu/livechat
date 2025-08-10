// src/common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    const { method, url } = req;
    const body = req.body ?? {};
    const start = Date.now();

    // 날짜 포맷 도우미
    const pad = (n: number) => String(n).padStart(2, '0');
    const now = new Date();
    const kst = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }), // KST 기준으로 문자열→Date
    );

    return next.handle().pipe(
      // tap은 async를 반환해도 파이프라인을 기다리지는 않지만, 로깅 용도로는 충분합니다.
      tap(async (data) => {
        try {
          const duration = Date.now() - start;

          const ts = kst.toISOString().replace('T', ' ').replace('Z', ' KST');

          const y = kst.getFullYear();
          const m = pad(kst.getMonth() + 1);
          const d = pad(kst.getDate());

          const fileName = `api_${y}-${m}-${d}.log`;

          // ✅ 디렉터리와 파일 경로 분리
          const logsDir = path.join(__dirname, '../../logs');
          await fs.mkdir(logsDir, { recursive: true }); // 폴더만 생성
          const filePath = path.join(logsDir, fileName);

          // ✅ 혹시 이전에 파일 경로가 디렉터리로 잘못 만들어졌다면 정리
          try {
            const st = await fs.lstat(filePath);
            if (st.isDirectory()) {
              await fs.rm(filePath, { recursive: true, force: true });
            }
          } catch {
            /* 파일이 없으면 패스 */
          }

          const line = `[${ts}] ${method} ${url} | ${duration}ms | body: ${JSON.stringify(body)} | response: ${JSON.stringify(data)}\n`;

          // 파일에 append (없으면 생성)
          await fs.appendFile(filePath, line, 'utf8');

          // 콘솔에도 출력(선택)
          console.log(line.trim());
        } catch (err) {
          // 로깅 실패가 요청 처리 자체를 깨지 않도록 방어
          // 필요 시 여기서만 경고 로그
          console.warn('[LoggingInterceptor] write failed:', (err as Error)?.message);
        }
      }),
    );
  }
}
