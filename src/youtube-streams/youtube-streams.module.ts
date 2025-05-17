import { Module } from '@nestjs/common';
import { YoutubeStreamsController } from './youtube-streams.controller';
import { YoutubeStreamsService } from './youtube-streams.service';

@Module({
  controllers: [YoutubeStreamsController],
  providers: [YoutubeStreamsService]
})
export class YoutubeStreamsModule {}
