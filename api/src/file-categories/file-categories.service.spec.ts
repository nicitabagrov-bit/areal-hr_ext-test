import { Test, TestingModule } from '@nestjs/testing';
import { FileCategoriesService } from './file-categories.service.js';
import { vi } from 'vitest';

describe('FileCategoriesService', () => {
  let service: FileCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileCategoriesService,
        {
          provide: 'PG_POOL',
          useValue: {
            query: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FileCategoriesService>(FileCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});