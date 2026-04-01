import { Test, TestingModule } from '@nestjs/testing';
import { DecadeService } from './decade.service';

describe('DecadeService', () => {
  let service: DecadeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DecadeService],
    }).compile();

    service = module.get<DecadeService>(DecadeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
