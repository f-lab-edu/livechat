import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, YoutubeStream } from '@prisma/client';

@Injectable()
export class YoutubeStreamsrepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByYoutubeStreamId(
    youtubeStreamId: number,
  ): Promise<YoutubeStream | null> {
    return this.prisma.youtubeStream.findUnique({
      where: { id: youtubeStreamId },
    });
  }

  async create(data: Prisma.YoutubeStreamCreateInput): Promise<YoutubeStream> {
    return this.prisma.youtubeStream.create({ data });
  }
}
