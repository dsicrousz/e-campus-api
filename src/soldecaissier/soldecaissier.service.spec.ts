import { Test, TestingModule } from '@nestjs/testing';
import { SoldecaissierService } from './soldecaissier.service';

describe('SoldecaissierService', () => {
  let service: SoldecaissierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoldecaissierService],
    }).compile();

    service = module.get<SoldecaissierService>(SoldecaissierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
