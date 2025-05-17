import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeStreamsService } from './youtube-streams.service';

describe('YoutubeStreamsService', () => {
  let service: YoutubeStreamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YoutubeStreamsService],
    }).compile();

    service = module.get<YoutubeStreamsService>(YoutubeStreamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
