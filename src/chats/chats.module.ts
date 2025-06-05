import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ChatGateway } from './chat.gateway';
import { ChatsRepository } from './chatRepository/chats.repository';
import { YoutubeStreamsModule } from '../youtube-streams/youtube-streams.module';

@Module({
  imports: [YoutubeStreamsModule],
  controllers: [ChatsController],
  providers: [ChatsService, ChatGateway, ChatsRepository],
})
export class ChatsModule {}
