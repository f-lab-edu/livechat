import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeStreamGateway } from './youtube-stream.gateway';

describe('YoutubeStreamGateway', () => {
  let gateway: YoutubeStreamGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YoutubeStreamGateway],
    }).compile();

    gateway = module.get<YoutubeStreamGateway>(YoutubeStreamGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
