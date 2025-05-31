import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByLoginId(loginId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { loginId } });
  }
  async findBySteamKey(streamKey: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { streamkey: streamKey } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findMany(params: Prisma.UserFindManyArgs): Promise<User[]> {
    return this.prisma.user.findMany(params);
  }

  //! 이렇게 바로 update 작성하는게 좋은지?
  //! 아니면 dto를 만들어서 사용하는게 좋은지?
  async updateStreamKey(loginId: string, streamKey: string): Promise<User> {
    return this.prisma.user.update({
      where: { loginId: loginId },
      data: { streamkey: streamKey },
    });
  }
  async updateLiveStatus(loginId: string, liveStatus: boolean): Promise<User> {
    return this.prisma.user.update({
      where: { loginId: loginId },
      data: { liveStatus: liveStatus },
    });
  }
}
