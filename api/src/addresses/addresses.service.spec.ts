import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service.js';
import { vi } from 'vitest';

describe('AddressesService', () => {
  let service: AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: 'PG_POOL',
          useValue: {
            query: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});