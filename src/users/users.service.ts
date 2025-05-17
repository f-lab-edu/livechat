import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, LoginUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {

    const existingUser = await this.prisma.user.findUnique({
      where: { loginId: createUserDto.loginId },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }


    const hashedPassword = await bcrypt.hash(createUserDto.loginPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        loginPassword: hashedPassword,
      },
    });

    // Remove password from response
    const { loginPassword, ...result } = user;
    return result;
  }

  async login(loginUserDto: LoginUserDto) {

    const user = await this.prisma.user.findUnique({
      where: { loginId: loginUserDto.loginId },
    });

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

    const { loginPassword, ...result } = user;
    return result;
  }
}

