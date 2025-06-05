import { Module } from '@nestjs/common';
import { YoutubeStreamsController } from './youtube-streams.controller';
import { YoutubeStreamsService } from './youtube-streams.service';
import { YoutubeStreamsrepository } from './youtube-streamsrepository/youtube-streams.repository';
import { YoutubeStreamGateway } from './gateway/youtube-stream.gateway';
import { FfmpegStreamService } from './gateway/ffmpeg-stream.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [YoutubeStreamsController],
  providers: [YoutubeStreamsService, YoutubeStreamsrepository, YoutubeStreamGateway, FfmpegStreamService],
  exports: [YoutubeStreamsService],
})
export class YoutubeStreamsModule {}
