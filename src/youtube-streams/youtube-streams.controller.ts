import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { YoutubeStreamsService } from './youtube-streams.service';
import { CreateYoutubeStreamReqDto } from './dto/youtube-stream.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt-strategy';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('youtube-streams')
export class YoutubeStreamsController {
  constructor(private readonly youtubeStreamsService: YoutubeStreamsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('live')
  async createYoutubeStream(
    @Body() createYoutubeStreamReqDto: CreateYoutubeStreamReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.youtubeStreamsService.createYoutubeStream(
      createYoutubeStreamReqDto,
      user.userId,
    );
    return { message: 'test' };
  }
}
