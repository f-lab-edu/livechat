import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './repository/users.repository';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/jwt-strategy';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    const existingUser = await this.usersRepo.findByLoginId(
      createUserDto.loginId,
    );

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
      console.log('test111');
      console.log('test12');

      const user = await this.usersRepo.findByLoginId(loginUserDto.loginId);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(
        loginUserDto.loginPassword,
        user.loginPassword,
      );

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
}
