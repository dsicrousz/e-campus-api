import { Test, TestingModule } from '@nestjs/testing';
import { SoldevendeurController } from './soldevendeur.controller';
import { SoldevendeurService } from './soldevendeur.service';

describe('SoldevendeurController', () => {
  let controller: SoldevendeurController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SoldevendeurController],
      providers: [SoldevendeurService],
    }).compile();

    controller = module.get<SoldevendeurController>(SoldevendeurController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
