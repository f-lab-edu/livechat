import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { YoutubeStreamsrepository } from './youtube-streamsrepository/youtube-streams.repository';
import { CreateYoutubeStreamReqDto, CreateYoutubeStreamPrismaInputDto, BroadcastStatus } from './dto/youtube-stream.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class YoutubeStreamsService {
  private readonly logger = new Logger(YoutubeStreamsService.name);

  constructor(
    private readonly youtubeStreamsRepo: YoutubeStreamsrepository,
    private readonly usersService: UsersService,
  ) {}

  async createYoutubeStream(createYoutubeStreamReqDto: CreateYoutubeStreamReqDto, userId: number) {
    const inputDto = new CreateYoutubeStreamPrismaInputDto(createYoutubeStreamReqDto.title, userId);
    await this.youtubeStreamsRepo.create(inputDto);
  }

  async startStream(youtubeStreamKey: string) {
    this.logger.log(`stream ID: ${youtubeStreamKey}`);

    // 스트림 키가 유효한지 판단
    const existingUser = await this.usersService.findByStreamKey(youtubeStreamKey);

    if (!existingUser) {
      this.logger.warn(`No stream found with ID: ${youtubeStreamKey}`);
      throw new ForbiddenException('존재하지 않는 스트림키 입니다.');
    }
    // 동시에 방송중인지 판단
    if (existingUser.liveStatus) {
      throw new ForbiddenException('이미 방송중인 스트림키 입니다.');
    }

    // 방송 준비 상태 데이터가 있는지 판단

    // 간단하게 방송 테스트 하는 목적

    // const existingLiveData = await this.youtubeStreamsRepo.getStreamReadyData(existingUser.id, BroadcastStatus.READY);
    // if (!existingLiveData) {
    //   this.logger.warn(`스트리밍 방송 준비 데이터가 없습니다.: ${existingUser.id}`);
    //   throw new ForbiddenException('방송 준비 상태가 아닙니다.');
    // }
    // await this.youtubeStreamsRepo.update(existingLiveData.id, BroadcastStatus.ON_AIR); // 방송 준비 상태를 true로 변경
    // await this.usersService.updateLiveStatus(existingUser.loginId, true); // 유저의 방송 상태를 true로 변경

    // 방송 준비 상태를 ture로 변경
  }

  async endStream(youtubeStreamKey: string) {
    const existingUser = await this.usersService.findByStreamKey(youtubeStreamKey);

    if (!existingUser) {
      this.logger.warn(`No stream found with ID: ${youtubeStreamKey}`);
      throw new ForbiddenException('존재하지 않는 스트림키 입니다.');
    }
    // const existingLiveData = await this.youtubeStreamsRepo.getStreamReadyData(existingUser.id, BroadcastStatus.ON_AIR);
    // if (!existingLiveData) {
    //   this.logger.warn(`스트리밍 방송 중 데이터가 없습니다.: ${existingUser.id}`);
    //   throw new ForbiddenException('방송 중 상태가 아닙니다.');
    // }
    // await this.usersService.updateLiveStatus(existingUser.loginId, false); // 유저의 방송 상태를 true로 변경
    // await this.youtubeStreamsRepo.updateStreamEndTime(existingLiveData.id);

    throw new Error('Method not implemented.');
  }
  async findByYoutubeStreamId(youtubeStreamId: number) {
    const youtubeStream = await this.youtubeStreamsRepo.findByYoutubeStreamId(youtubeStreamId);
    if (!youtubeStream) {
      throw new ForbiddenException('존재하지 않는 스트림입니다.');
    }
    return youtubeStream;
  }
}
