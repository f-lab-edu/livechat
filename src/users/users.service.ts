import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './repository/users.repository';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/jwt-strategy';
import { encryptStreamKey, StreamKeyPayload } from './streamkey.crypto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    const existingUser = await this.usersRepo.findByLoginId(createUserDto.loginId);

    if (existingUser) {
      throw new ConflictException('이미 존재하는 아이디 입니다.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.loginPassword, 10);

    await this.usersRepo.create({
      loginId: createUserDto.loginId,
      loginPassword: hashedPassword,
      nickname: createUserDto.nickname,
    });
  }

  async login(loginUserDto: LoginUserDto): Promise<string> {
    try {
      const user = await this.usersRepo.findByLoginId(loginUserDto.loginId);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(loginUserDto.loginPassword, user.loginPassword);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: JwtPayload = { userId: user.id, loginId: user.loginId };
      return this.jwtService.sign(payload);
    } catch (error) {
      // DB 또는 bcrypt 에러 처리
      console.log(error);
      throw new UnauthorizedException('로그인 중 오류가 발생했습니다.');
    }
  }

  async getStreamKeyfindByLoginId(loginId: string): Promise<string | null> {
    const userData = await this.usersRepo.findByLoginId(loginId);
    if (!userData) {
      return null;
    }

    const streamKey: string | null = userData.streamkey ?? null;

    return streamKey;
  }
  async findByStreamKey(streamKey: string): Promise<User | null> {
    const existingUser = await this.usersRepo.findBySteamKey(streamKey);
    return existingUser ?? null;
  }

  async createStreamKey(loginId: string): Promise<string> {
    const existingUser = await this.usersRepo.findByLoginId(loginId);

    if (!existingUser) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    if (existingUser.streamkey) {
      throw new ConflictException('이미 스트림키가 존재합니다.');
    }

    const payload: StreamKeyPayload = { loginId: existingUser.loginId };
    const streamKey = encryptStreamKey(payload);

    await this.usersRepo.updateStreamKey(existingUser.loginId, streamKey);

    return streamKey;
  }

  async updateLiveStatus(loginId: string, liveStatus: boolean): Promise<void> {
    const existingUser = await this.usersRepo.findByLoginId(loginId);

    if (!existingUser) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    await this.usersRepo.updateLiveStatus(existingUser.loginId, liveStatus);
  }
}
