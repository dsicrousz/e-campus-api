import { Test, TestingModule } from '@nestjs/testing';
import { SoldevendeurService } from './soldevendeur.service';

describe('SoldevendeurService', () => {
  let service: SoldevendeurService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoldevendeurService],
    }).compile();

    service = module.get<SoldevendeurService>(SoldevendeurService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
