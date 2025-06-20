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
import { FfmpegStreamService } from './ffmpeg-stream.service';
import { CurrentSocketUser } from '../../auth/current-user.decorator';
import { JwtPayload } from '../../auth/jwt-strategy';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'stream' })
export class YoutubeStreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly ffmpegStreamService: FfmpegStreamService) {}
  @WebSocketServer()
  server: Server;

  // 클라이언트가 Websocket 서버에 연결될 대 자동으로 호출
  handleConnection(client: Socket) {
    this.ffmpegStreamService.createFfmpegProcess(client);
  }

  // 클라이언트가 Websocket 서버와 연결을 끊을 때 자동으로 호출
  handleDisconnect(client: Socket) {
    this.ffmpegStreamService.closeFfmpegProcess(client);
  }

  @SubscribeMessage('stream')
  async handleStream(@MessageBody() data: Buffer, @ConnectedSocket() client: Socket, @CurrentSocketUser() user: JwtPayload) {
    await this.ffmpegStreamService.handleStream(client, data, user);
  }
}
