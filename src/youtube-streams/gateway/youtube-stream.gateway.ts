import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class YoutubeStreamGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private ffmpegMap = new Map<string, ChildProcessWithoutNullStreams>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    // FFmpeg 프로세스 시작
    const streamKey = client.handshake.query.streamKey;

    // streamKey 문자열이 아닌 경우 예외 처리
    if (typeof streamKey !== 'string') {
      client.disconnect();
      console.error('Invalid streamKey');
      return;
    }

    // const outputFilename = `/app/recordings/${streamKey}-${Date.now()}.mp4`;

    const ffmpeg = spawn('ffmpeg', [
      '-re',
      '-i',
      'pipe:0',
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-tune',
      'zerolatency',
      '-c:a',
      'aac',
      '-f',
      'flv',
      `rtmp://nginx-hls/stream/${streamKey}`,
    ]);

    ffmpeg.on('error', (err) => {
      console.error(`❌ Failed to spawn FFmpeg for ${client.id}:`, err.message);
      client.emit('ffmpeg_error', { message: err.message });
      client.disconnect(); // 필요 시 클라이언트 종료
    });

    ffmpeg.stderr.setEncoding('utf8');

    ffmpeg.stderr.on('data', (data) => {
      console.log('==========================data======================');
      console.log(`[FFmpeg ${client.id}]`, data);
    });

    ffmpeg.on('close', (code) => {
      console.log('========================ERROR========================');
      console.log(`FFmpeg process closed with code ${code}`);
      this.ffmpegMap.delete(client.id);
    });
    this.ffmpegMap.set(client.id, ffmpeg);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const ffmpeg = this.ffmpegMap.get(client.id);
    if (ffmpeg) {
      ffmpeg.stdin.end();
      ffmpeg.kill('SIGINT');
      this.ffmpegMap.delete(client.id);
    }
  }

  @SubscribeMessage('stream')
  handleStream(@MessageBody() data: Buffer, @ConnectedSocket() client: Socket) {
    console.log('[server] handleStream called', client.id); // ⭐ 추가
    const ffmpeg = this.ffmpegMap.get(client.id);
    if (!ffmpeg || !ffmpeg.stdin.writable) {
      console.error(`FFmpeg process not found for ${client.id}`);
      return;
    }

    try {
      console.log('========================stream========================');
      ffmpeg.stdin.write(data);
    } catch (err) {
      if (err instanceof Error) {
        console.error(
          `FFmpeg stdin write error for ${client.id}:`,
          err.message,
        );
      } else {
        console.error(`FFmpeg stdin write error for ${client.id}:`, err);
      }
    }
  }
}
