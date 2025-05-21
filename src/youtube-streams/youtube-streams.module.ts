import { Module } from '@nestjs/common';
import { YoutubeStreamsController } from './youtube-streams.controller';
import { YoutubeStreamsService } from './youtube-streams.service';
import { YoutubeStreamsrepository } from './youtube-streamsrepository/youtube-streamsrepository';
import { YoutubeStreamGateway } from './gateway/youtube-stream.gateway';

@Module({
  controllers: [YoutubeStreamsController],
  providers: [
    YoutubeStreamsService,
    YoutubeStreamsrepository,
    YoutubeStreamGateway,
  ],
})
export class YoutubeStreamsModule {}
