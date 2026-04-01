import { Test, TestingModule } from '@nestjs/testing';
import { DecadeController } from './decade.controller';
import { DecadeService } from './decade.service';

describe('DecadeController', () => {
  let controller: DecadeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DecadeController],
      providers: [DecadeService],
    }).compile();

    controller = module.get<DecadeController>(DecadeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
