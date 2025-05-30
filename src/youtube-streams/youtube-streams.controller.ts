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

  // 라이브 썸네일 생성
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('live')
  async createYoutubeStream(
    @Body() createYoutubeStreamReqDto: CreateYoutubeStreamReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.youtubeStreamsService.createYoutubeStream(createYoutubeStreamReqDto, user.userId);
    return { message: 'test' };
  }

  // obs 통해서 스트리밍 시작 하기 전에 스트림키 인증단계
  // 라이브 스트리밍과 OBS 통해서 스트리망이 동시에 스트리밍이 불가
  @Post('on-publish')
  async onPublish(@Body() body: any) {}

  // 스트림키 조회

  @Get('stream-key')
  async getStreamKey(): Promise<{ streamKey: string }> {
    // 스트림키 조회 로직
    return { streamKey: 'exampleStreamKey123' };
  }

  // 스트림키 생성
  @Post('stream-key')
  async createStreamKey(): Promise<{ streamKey: string }> {
    // 스트림키 생성 로직
    const streamKey = 'newStreamKey456'; // 예시로 고정된 스트림키 사용
    return { streamKey };
  }

  // 스트리밍 중인 방송 리스트
}
