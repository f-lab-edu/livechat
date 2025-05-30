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
import { ChildProcessWithoutNullStreams } from 'child_process';
import { YoutubeStreamsService } from '../youtube-streams.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class YoutubeStreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly youtubeStreamService: YoutubeStreamsService) {}
  @WebSocketServer()
  server: Server;

  private ffmpegMap = new Map<string, ChildProcessWithoutNullStreams>();

  // 클라이언트가 Websocket 서버에 연결될 대 자동으로 호출
  handleConnection(client: Socket) {
    this.youtubeStreamService.createFfmpegProcess(client, this.ffmpegMap);
  }

  // 클라이언트가 Websocket 서버와 연결을 끊을 때 자동으로 호출
  handleDisconnect(client: Socket) {
    this.youtubeStreamService.closeFfmpegProcess(client, this.ffmpegMap);
  }

  @SubscribeMessage('stream')
  handleStream(@MessageBody() data: Buffer, @ConnectedSocket() client: Socket) {
    this.youtubeStreamService.handleStream(client.id, data, this.ffmpegMap);
  }
}
