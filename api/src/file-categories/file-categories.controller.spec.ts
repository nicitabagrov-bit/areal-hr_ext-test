import { Test, TestingModule } from '@nestjs/testing';
import { FileCategoriesController } from './file-categories.controller.js';
import { FileCategoriesService } from './file-categories.service.js';

describe('FileCategoriesController', () => {
  let controller: FileCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileCategoriesController],
      providers: [FileCategoriesService],
    }).compile();

    controller = module.get<FileCategoriesController>(FileCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
