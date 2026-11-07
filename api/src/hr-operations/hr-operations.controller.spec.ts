import { Test, TestingModule } from '@nestjs/testing';
import { HrOperationsController } from './hr-operations.controller.js';
import { HrOperationsService } from './hr-operations.service.js';

describe('HrOperationsController', () => {
  let controller: HrOperationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrOperationsController],
      providers: [HrOperationsService],
    }).compile();

    controller = module.get<HrOperationsController>(HrOperationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
