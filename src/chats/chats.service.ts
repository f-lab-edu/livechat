import { Injectable, Logger } from '@nestjs/common';
import { ChatsRepository } from './chatRepository/chats.repository';
import { YoutubeStreamsService } from '../youtube-streams/youtube-streams.service';
import { Socket } from 'socket.io';
import { JwtPayload } from '../auth/jwt-strategy';

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);

  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly youtubeStreamsService: YoutubeStreamsService,
  ) {}

  async createChat(youtubeStreamId: number, message: string, userId: number): Promise<void> {
    // 여기에 채팅 메시지를 저장하는 로직을 구현합니다.
    this.logger.log(`채팅 메시지 저장: ${message} (Stream ID: ${youtubeStreamId}, userId ID: ${userId})`);
    // 예시로 로그에 출력
    await this.chatsRepository.createChat(youtubeStreamId, message, userId);
  }

  async joinRoom(client: Socket, youtubeStreamId: number, user?: JwtPayload): Promise<void> {
    // 채팅방에 입장하는 로직을 구현합니다.
    this.logger.log(`유저 ${user?.userId ?? null}가 채팅방에 입장: Stream ID ${youtubeStreamId}`);
    await client.join(`room-${youtubeStreamId}`);

    // 예시로 로그에 출력
  }

  async leaveRoom(client: Socket, youtubeStreamId: number): Promise<void> {
    // 채팅방에서 나가는 로직을 구현합니다.
    this.logger.log(`유저가 채팅방에서 나감: Stream ID ${youtubeStreamId}`);
    await client.leave(`room-${youtubeStreamId}`);
  }
}
