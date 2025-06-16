import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export enum BroadcastStatus {
  READY = 0, // 방송 준비(아직 시작 전) 상태
  ON_AIR = 1, // 방송 중(실제 송출 중) 상태
  ENDED = 2, // 방송 종료(정상 종료) 상태
  ERROR = 3, // 방송 중 오류 발생 상태
}
export class CreateYoutubeStreamReqDto {
  @ApiProperty({
    example: '유튜브제목',
    description: '라이브 방송 제목',
  })
  title: string;
}

export class OnPublishDto {
  @ApiProperty({ example: 'live', description: 'RTMP application name' })
  @IsString()
  app: string;

  @ApiProperty({ example: 'abcd1234', description: 'Stream key' })
  @IsString()
  name: string;

  @ApiProperty({ example: '192.168.0.1', description: 'Client IP address' })
  @IsString()
  addr: string;

  @ApiProperty({ example: '1', description: 'Client ID' })
  @IsString()
  @IsOptional()
  args?: string;
}

export class CreateYoutubeStreamPrismaInputDto implements Prisma.YoutubeStreamCreateInput {
  title: string;
  thumbnail: string;
  streamStartTime: Date;
  streamingUrl: string;
  user: {
    connect: {
      id: number;
    };
  };

  constructor(title: string, userId: number) {
    this.title = title;
    this.thumbnail = 'thumbnail';
    this.streamStartTime = new Date();
    this.streamingUrl = 'streamingUrl';
    this.user = {
      connect: { id: userId },
    };
  }
}
