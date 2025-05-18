import { Module } from '@nestjs/common';
import { StreamStatsController } from './stream-stats.controller';
import { StreamStatsService } from './stream-stats.service';

@Module({
  controllers: [StreamStatsController],
  providers: [StreamStatsService],
})
export class StreamStatsModule {}
