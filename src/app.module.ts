import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { YoutubeStreamsModule } from './youtube-streams/youtube-streams.module';
import { SstreamStatsModule } from './sstream-stats/sstream-stats.module';
import { ChatsModule } from './chats/chats.module';
import { StreamStatsModule } from './stream-stats/stream-stats.module';

@Module({
  imports: [UsersModule, YoutubeStreamsModule, SstreamStatsModule, ChatsModule, StreamStatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
