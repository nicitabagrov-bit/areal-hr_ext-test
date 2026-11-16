import { Test, TestingModule } from '@nestjs/testing';
import { PassportsService } from './passports.service.js';
import { vi } from 'vitest';

describe('PassportsService', () => {
  let service: PassportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassportsService,
        {
          provide: 'PG_POOL',
          useValue: {
            query: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PassportsService>(PassportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});