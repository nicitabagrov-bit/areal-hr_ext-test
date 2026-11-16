import { Test, TestingModule } from '@nestjs/testing';
import { HrOperationsService } from './hr-operations.service.js';
import { HistoryLogger } from '../change-history/history-logger.service.js';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('HrOperationsService', () => {
  let service: HrOperationsService;
  let mockPool: any;
  let mockHistoryLogger: any;

  beforeEach(async () => {
    mockPool = {
      query: vi.fn(),
    };
    mockHistoryLogger = {
      log: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrOperationsService,
        { provide: 'PG_POOL', useValue: mockPool },
        { provide: HistoryLogger, useValue: mockHistoryLogger },
      ],
    }).compile();

    service = module.get<HrOperationsService>(HrOperationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('должен вызывать UPDATE для employees при увольнении', async () => {
    // Мокаем проверку сотрудника (он существует, не уволен, у него есть отдел)
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: 'emp1', dismissed_at: null, department_id: 'dep1' }], rowCount: 1 });
    // Мокаем UPDATE employees
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });
    // Мокаем INSERT в hr_operations
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: 'op1', operation_type: 'dismissal' }] });

    await service.create({ employee_id: 'emp1', operation_type: 'dismissal' });

    // Проверяем, что второй запрос был именно UPDATE employees SET dismissed_at
    expect(mockPool.query).toHaveBeenNthCalledWith(
      2,
      'UPDATE employees SET dismissed_at = now() WHERE id = $1',
      ['emp1']
    );
  });
});