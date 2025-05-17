import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeStreamsController } from './youtube-streams.controller';

describe('YoutubeStreamsController', () => {
  let controller: YoutubeStreamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YoutubeStreamsController],
    }).compile();

    controller = module.get<YoutubeStreamsController>(YoutubeStreamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
