import { Module } from '@nestjs/common';
import { YoutubeStreamsController } from './youtube-streams.controller';
import { YoutubeStreamsService } from './youtube-streams.service';
import { YoutubeStreamsrepository } from './youtube-streamsrepository/youtube-streamsrepository';

@Module({
  controllers: [YoutubeStreamsController],
  providers: [YoutubeStreamsService, YoutubeStreamsrepository],
})
export class YoutubeStreamsModule {}
