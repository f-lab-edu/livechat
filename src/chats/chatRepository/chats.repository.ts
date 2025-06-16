import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createChat(youtubeStreamId: number, message: string, userId: number): Promise<void> {
    await this.prisma.chat.create({
      data: {
        youtubeStreamId,
        message,
        userId,
        createdAt: new Date(),
      },
    });
  }
}
