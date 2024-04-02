import { Test, TestingModule } from '@nestjs/testing';
import { AlertStreamService } from './alert-stream.service';

describe('AlertStreamService', () => {
  let service: AlertStreamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertStreamService],
    }).compile();

    service = module.get<AlertStreamService>(AlertStreamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
