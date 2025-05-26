import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginUserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string }> {
    await this.usersService.create(createUserDto);
    return { message: '회원가입 성공' };
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ message: string; accessToken: string }> {
    const accessToken = await this.usersService.login(loginUserDto);

    return { message: '로그인 성공', accessToken: accessToken };
  }
}
