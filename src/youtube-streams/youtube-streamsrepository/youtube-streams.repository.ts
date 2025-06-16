import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, YoutubeStream } from '@prisma/client';
import { BroadcastStatus } from '../dto/youtube-stream.dto';

@Injectable()
export class YoutubeStreamsrepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByYoutubeStreamId(youtubeStreamId: number): Promise<YoutubeStream | null> {
    return this.prisma.youtubeStream.findUnique({
      where: { id: youtubeStreamId },
    });
  }

  async create(data: Prisma.YoutubeStreamCreateInput): Promise<YoutubeStream> {
    return this.prisma.youtubeStream.create({ data });
  }

  async update(streamId: number, liveReady: number): Promise<YoutubeStream> {
    return this.prisma.youtubeStream.update({
      where: { id: streamId },
      data: {
        streamStartTime: new Date(),
        liveReady: liveReady, // 방송 준비 상태를 true로 변경
      },
    });
  }
  async updateStreamEndTime(streamId: number): Promise<YoutubeStream> {
    return this.prisma.youtubeStream.update({
      where: { id: streamId, liveReady: BroadcastStatus.ON_AIR }, // 방송 중인 상태에서만 종료 시간 업데이트
      data: {
        streamEndTime: new Date(), // 방송 종료 시간 업데이트
      },
    });
  }

  async getStreamReadyData(userId: number, liveReady: number): Promise<YoutubeStream | null> {
    return this.prisma.youtubeStream.findFirst({
      where: {
        userId,
        liveReady: liveReady, // 방송 준비 상태
      },
      orderBy: {
        id: 'desc',
      },
    });
  }
}
