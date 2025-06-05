import { Test, TestingModule } from '@nestjs/testing';
import { FfmpegStreamService } from './ffmpeg-stream.service';

describe('FfmpegStreamService', () => {
  let service: FfmpegStreamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FfmpegStreamService],
    }).compile();

    service = module.get<FfmpegStreamService>(FfmpegStreamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
