import { Injectable } from '@nestjs/common';
import { YoutubeStreamsrepository } from './youtube-streamsrepository/youtube-streamsrepository';
import { CreateYoutubeStreamReqDto } from './dto/youtube-stream.dto';

@Injectable()
export class YoutubeStreamsService {
  constructor(private readonly youtubeStreamsRepo: YoutubeStreamsrepository) {}

  async createYoutubeStream(
    createYoutubeStreamReqDto: CreateYoutubeStreamReqDto,
    userId: number,
  ) {
    await this.youtubeStreamsRepo.create({
      title: createYoutubeStreamReqDto.title,
      thumbnail: 'thumbnail',
      streamStartTime: new Date(),
      streamingUrl: 'streamingUrl',
      user: {
        connect: { id: userId },
      },
    });
  }
}
