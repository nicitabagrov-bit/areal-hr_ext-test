import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { HrOperationsService } from './hr-operations.service.js';
import { HistoryLogger } from '../change-history/history-logger.service.js';

describe('HrOperationsService', () => {
  let service: HrOperationsService;

  const mockPool = {
    query: vi.fn(),
    connect: vi.fn().mockReturnValue({
      query: vi.fn(),
      release: vi.fn(),
    }),
  };

  const mockHistoryLogger = {
    log: vi.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrOperationsService,
        { provide: 'PG_POOL', useValue: mockPool },
        { provide: HistoryLogger, useValue: mockHistoryLogger },
      ],
    }).compile();

    service = module.get<HrOperationsService>(HrOperationsService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  it('должен вызывать UPDATE для employees при увольнении', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: '123', dismissed_at: null }], rowCount: 1 });
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: 'op1', operation_type: 'dismissal' }], rowCount: 1 });

    await service.create({ employee_id: '123', operation_type: 'dismissal' });

    expect(mockPool.query).toHaveBeenCalledWith(
      'UPDATE employees SET dismissed_at = now() WHERE id = $1',
      ['123'],
    );
  });
});