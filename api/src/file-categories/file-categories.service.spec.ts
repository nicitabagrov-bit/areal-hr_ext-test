import { Test, TestingModule } from '@nestjs/testing';
import { FileCategoriesService } from './file-categories.service.js';

describe('FileCategoriesService', () => {
  let service: FileCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileCategoriesService],
    }).compile();

    service = module.get<FileCategoriesService>(FileCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
