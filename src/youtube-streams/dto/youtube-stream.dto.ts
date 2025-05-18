import { ApiProperty } from '@nestjs/swagger';

export class CreateYoutubeStreamReqDto {
  @ApiProperty({
    example: '유튜브제목',
    description: '라이브 방송 제목',
  })
  title: string;
}
