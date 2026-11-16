import { Test, TestingModule } from '@nestjs/testing';
import { FileCategoriesController } from './file-categories.controller.js';
import { FileCategoriesService } from './file-categories.service.js';
import { vi } from 'vitest';

describe('FileCategoriesController', () => {
  let controller: FileCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileCategoriesController],
      providers: [
        {
          provide: FileCategoriesService,
          useValue: {
            findAll: vi.fn(),
            findOne: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            softDelete: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FileCategoriesController>(FileCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});