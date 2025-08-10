import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { CurrentSocketUser, OptionalSocketUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt-strategy';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('[GW] afterInit');
  }
  handleConnection(socket: Socket) {
    console.log('[GW] connection', socket.id);
  }
  handleDisconnect(socket: Socket) {
    console.log('[GW] disconnect', socket.id);
  }

  constructor(private readonly chatsService: ChatsService) {}
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { youtubeStreamId: number; token: string },
    @ConnectedSocket() client: Socket,
    //  @OptionalSocketUser() user?: JwtPayload,
  ): Promise<string> {
    const user = jwt.verify(data.token, process.env.JWT_SECRET!) as JwtPayload;
    await this.chatsService.joinRoom(client, data.youtubeStreamId, user);
    await this.broadcastViewerCount(data.youtubeStreamId);
    console.log('User joined room:', data.youtubeStreamId, 'User:', user ? user.loginId : 'Anonymous');
    return `채팅방에 입장되었습니다. room-${data.youtubeStreamId}`;
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(@MessageBody() data: { youtubeStreamId: number }, @ConnectedSocket() client: Socket): Promise<void> {
    await this.chatsService.leaveRoom(client, data.youtubeStreamId);
    await this.broadcastViewerCount(data.youtubeStreamId);
  }

  @SubscribeMessage('chat')
  async handleChat(
    @MessageBody() data: { youtubeStreamId: number; message: string; token: string },
    @ConnectedSocket() client: Socket,
    // @CurrentSocketUser() user: JwtPayload,
  ): Promise<void> {
    const user = jwt.verify(data.token, process.env.JWT_SECRET!) as JwtPayload;
    console.log('Chat message received:', data.message, 'from user:', user ? user.loginId : 'Anonymous');
    await this.chatsService.createChat(data.youtubeStreamId, data.message, user.userId);
    this.server.to(`room-${data.youtubeStreamId}`).emit('chat', data.message);
  }

  private async broadcastViewerCount(youtubeStreamId: number) {
    const roomName = `room-${youtubeStreamId}`;
    const clients = await this.server.in(roomName).allSockets();
    const viewerCount = clients.size;
    this.server.to(roomName).emit('viewerCount', viewerCount);
  }
}
