import { Injectable, Logger } from '@nestjs/common';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { Socket } from 'socket.io';
import { JwtPayload } from '../../auth/jwt-strategy';
import { UsersService } from '../../users/users.service';

@Injectable()
export class FfmpegStreamService {
  private readonly logger = new Logger(FfmpegStreamService.name);

  private readonly ffmpegMap = new Map<string, ChildProcessWithoutNullStreams>();
  constructor(private readonly usersService: UsersService) {}

  createFfmpegProcess(client: Socket) {
    this.logger.log(`서버와 연결되었습니다.: ${client.id}`);
    const streamKey = client.handshake.query.streamKey;

    if (typeof streamKey !== 'string') {
      client.disconnect();
      this.logger.error('잘못된 streamKey');
      return;
    }

    //spawn 자체가 비동기(non-blocking) API return ChildProcess 객체(ffmpeg)를 돌려주고, 내부적으로 FFmpeg 프로세스는 백그라운드에서 실행됩니다
    // prettier-ignore
    const ffmpeg = spawn('ffmpeg', [
        '-f','webm','-i','pipe:0',
  
        // 명시적 stream mapping
        '-map','0:v:0','-map','0:a:0',
  
        // 영상 인코딩
        '-c:v','libx264','-preset','veryfast','-profile:v','baseline','-g','30','-keyint_min','30','-sc_threshold','0',
        // 오디오 인코딩
        '-c:a','aac','-ar','48000','-b:a','128k',
  
        // HLS가 이해 가능한 포맷
        '-f','flv',`rtmp://nginx-hls/stream/${streamKey}`,
      ]);

    // ffmpeg 프로세스 생성이나 실행 중 오류 발생 시 처리
    ffmpeg.on('error', (err) => {
      this.logger.error(`❌ Failed 프로세스 생성 실패 streamKey ${streamKey}:`, err.message);
      client.emit('❌ ffmpeg 에러');
      client.disconnect();
    });
    // ffmpeg가 실행 중에 출력하는 로그, 경고, 에러 메시지을 한글로 처리
    ffmpeg.stderr.setEncoding('utf8');
    ffmpeg.stderr.on('data', (data) => {
      this.logger.log(`FFmpeg stderr for streamKey ${streamKey} , ffmpeg : ${client.id}: ${data}`);
    });

    ffmpeg.on('close', (code) => {
      this.logger.log(`FFmpeg process closed with code ${code} for streamKey ${streamKey}`);
      this.ffmpegMap.delete(client.id);
    });

    this.ffmpegMap.set(client.id, ffmpeg);
  }

  closeFfmpegProcess(client: Socket) {
    this.logger.log(`서버과 연결 종료되었습니다.: ${client.id}`);
    const ffmpeg = this.ffmpegMap.get(client.id);
    if (ffmpeg) {
      ffmpeg.stdin.end();
      ffmpeg.kill('SIGINT');
      this.ffmpegMap.delete(client.id);
    }
  }

  async handleStream(client: Socket, data: Buffer, user: JwtPayload): Promise<void> {
    this.logger.log(`라이브 데이터 전송 ${client.id}`);
    // 라이브 시작시간 insert 해야함
    const ffmpeg = this.ffmpegMap.get(client.id);

    const clientStreamKey = client.handshake.query.streamKey;

    if (typeof clientStreamKey !== 'string') {
      client.disconnect();
      this.logger.error('잘못된 streamKey');
      return;
    }

    const userStreamKey = await this.usersService.getStreamKeyfindByLoginId(user.loginId);
    this.logger.log(`클라이언트 streamKey: ${clientStreamKey}, 사용자 streamKey: ${userStreamKey}`);
    if (!userStreamKey) {
      this.logger.error(`사용자의 streamKey가 없습니다: ${user.loginId}`);
      client.emit('error', 'StreamKey가 없습니다');
      return;
    }

    if (userStreamKey !== clientStreamKey) {
      this.logger.error(`StreamKey mismatch for ${client.id}. 클라이언트의 streamKey: ${clientStreamKey} / 사용자 streamKey: ${userStreamKey}`);
      client.emit('error', 'StreamKey 검증 실패');
      return;
    }

    if (!ffmpeg || !ffmpeg.stdin.writable) {
      this.logger.error(`FFmpeg process not found or not writable for ${client.id}`);
      return;
    }

    try {
      this.logger.log('======================== stream ========================');
      ffmpeg.stdin.write(data);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`FFmpeg stdin write error for ${client.id}: ${errMsg}`);
    }
  }
}
