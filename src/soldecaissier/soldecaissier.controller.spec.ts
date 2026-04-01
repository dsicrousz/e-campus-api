import { Test, TestingModule } from '@nestjs/testing';
import { SoldecaissierController } from './soldecaissier.controller';
import { SoldecaissierService } from './soldecaissier.service';

describe('SoldecaissierController', () => {
  let controller: SoldecaissierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SoldecaissierController],
      providers: [SoldecaissierService],
    }).compile();

    controller = module.get<SoldecaissierController>(SoldecaissierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
