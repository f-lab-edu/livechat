import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { YoutubeStreamsModule } from './youtube-streams/youtube-streams.module';

import { ChatsModule } from './chats/chats.module';
import { StreamStatsModule } from './stream-stats/stream-stats.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    UsersModule,
    YoutubeStreamsModule,
    ChatsModule,
    StreamStatsModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
