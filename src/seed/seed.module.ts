import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { LoggerService } from '../logger/logger.service';

@Module({
   providers: [SeedService, LoggerService],
   exports: [SeedService]
})
export class SeedModule {}
