import { Test, TestingModule } from '@nestjs/testing';
import { DbMigrationService } from './db-migration.service';

describe('DbMigrationService', () => {
  let service: DbMigrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbMigrationService],
    }).compile();

    service = module.get<DbMigrationService>(DbMigrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
