import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service.js';

describe('OrganizationsService', () => {
  let service: OrganizationsService;

  // Мокаем пул базы данных (чтобы тест не лез в реальную базу)
  const mockPool = {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: 'PG_POOL', useValue: mockPool },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  it('должен возвращать пустой массив при вызове findAll', async () => {
    const result = await service.findAll();
    expect(result).toEqual([]);
  });
});