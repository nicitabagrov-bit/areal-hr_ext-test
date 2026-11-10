import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PositionsService } from './positions.service.js';
import { HistoryLogger } from '../change-history/history-logger.service.js';

describe('PositionsService', () => {
  let service: PositionsService;

  // Мокаем пул базы данных
  const mockPool = {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  };

  // Мокаем логгер истории
  const mockHistoryLogger = {
    log: vi.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionsService,
        { provide: 'PG_POOL', useValue: mockPool },
        { provide: HistoryLogger, useValue: mockHistoryLogger },
      ],
    }).compile();

    service = module.get<PositionsService>(PositionsService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  it('должен возвращать пустой массив при вызове findAll', async () => {
    const result = await service.findAll();
    expect(result).toEqual([]);
  });
});