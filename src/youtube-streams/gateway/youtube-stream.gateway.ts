import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
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
      `rtmp://localhost/live/${streamKey}`,
    ]);

    ffmpeg.stderr.setEncoding('utf8');

    ffmpeg.stderr.on('data', (data) => {
      console.log(`[FFmpeg ${client.id}]`, data);
    });

    ffmpeg.on('close', (code) => {
      console.log(`FFmpeg process closed with code ${code}`);
    });
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
  handleStream(@MessageBody() data: Buffer, client: Socket) {
    const ffmpeg = this.ffmpegMap.get(client.id);
    if (ffmpeg && ffmpeg.stdin.writable) {
      ffmpeg.stdin.write(data);
    }
  }
}
