import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'user01', description: '로그인 ID' })
  loginId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'securepassword123', description: '비밀번호' })
  loginPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '재원', description: '닉네임' })
  nickname: string;
}

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'user01', description: '로그인 ID' })
  loginId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'securepassword123', description: '비밀번호' })
  loginPassword: string;
}
