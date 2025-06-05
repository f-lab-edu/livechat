import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginUserDto } from './dto/user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt-strategy';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<{ message: string }> {
    await this.usersService.create(createUserDto);
    return { message: '회원가입 성공' };
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<{ message: string; accessToken: string }> {
    const accessToken = await this.usersService.login(loginUserDto);

    return { message: '로그인 성공', accessToken: accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('stream-key')
  async getStreamKey(@CurrentUser() user: JwtPayload): Promise<{ streamKey: string | null }> {
    const streamKey = await this.usersService.getStreamKeyfindByLoginId(user.loginId);
    // 스트림키 조회 로직
    return { streamKey: streamKey };
  }

  // 스트림키 생성
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('stream-key')
  async createStreamKey(@CurrentUser() user: JwtPayload): Promise<{ streamKey: string }> {
    // 스트림키 생성 로직
    const streamKey = await this.usersService.createStreamKey(user.loginId);
    return { streamKey: streamKey };
  }
}
