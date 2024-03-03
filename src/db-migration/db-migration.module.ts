import { Module } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { DbMigrationService } from './db-migration.service';

@Module({
   providers: [DbMigrationService, LoggerService],
   exports: [DbMigrationService]
})
export class DbMigrationModule {}
