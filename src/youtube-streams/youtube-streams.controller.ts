import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { YoutubeStreamsService } from './youtube-streams.service';
import { CreateYoutubeStreamReqDto, OnPublishDto } from './dto/youtube-stream.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt-strategy';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('youtube-streams')
export class YoutubeStreamsController {
  constructor(private readonly youtubeStreamsService: YoutubeStreamsService) {}

  // 방송 송출하기 전 준비단계
  // 필요한 데이터 미리 저장합니다
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('streamData')
  async createYoutubeStreamData(
    @Body() createYoutubeStreamReqDto: CreateYoutubeStreamReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.youtubeStreamsService.createYoutubeStream(createYoutubeStreamReqDto, user.userId);
    return { message: '방송 송출 준비 완료되었습니다..' };
  }

  // obs 통해서 스트리밍 시작 하기 전에 스트림키 인증단계
  // OBS 하기 전에 방송 준비 상태가 되었는지 검증함
  // 라이브 스트리밍과 OBS 통해서 스트리망이 동시에 스트리밍이 불가
  @Post('on-live')
  async onPublish(@Body() body: OnPublishDto) {
    const streamKey = body.name;

    await this.youtubeStreamsService.startStream(streamKey);

    return { code: 0 }; // 인증 성공
  }
  // 스트리밍 중인 방송 종료
  @Post('on-live-done')
  async onLiveDone(@Body() body: OnPublishDto) {
    const streamKey = body.name;

    await this.youtubeStreamsService.endStream(streamKey);

    return { code: 0 }; // 인증 성공
  }

  // 스트리밍 중인 방송 리스트 조회
}
