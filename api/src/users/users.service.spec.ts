import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { vi } from 'vitest';

describe('UsersService', () => {
  let service: UsersService;

  const mockPool = {
    query: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'PG_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit (создание первого админа)', () => {
    it('создаёт админа, если пользователей нет', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'admin' }], rowCount: 1 })
        .mockResolvedValueOnce({ rowCount: 1 });

      await service.onModuleInit();

      expect(mockPool.query).toHaveBeenCalledTimes(3);
    });

    it('ничего не делает, если пользователи уже есть', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ count: '5' }] });

      await service.onModuleInit();

      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('возвращает список пользователей', async () => {
      const users = [
        { id: 'u1', login: 'admin', role_name: 'admin', deleted_at: null },
      ];
      mockPool.query.mockResolvedValueOnce({ rows: users });

      const result = await service.findAll();

      expect(result).toEqual(users);
    });
  });

  describe('create', () => {
    const dto = {
      last_name: 'Иванов',
      first_name: 'Иван',
      login: 'ivanov',
      password: 'strong-pass-123',
      role_id: 'role-2',
    };

    it('создаёт пользователя', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'u2', login: 'ivanov' }] });

      const result = await service.create(dto as any);

      expect(result).toEqual({ id: 'u2', login: 'ivanov' });

      const insertCall = mockPool.query.mock.calls[1];
      expect(insertCall[1]).not.toContain('strong-pass-123');
    });

    it('бросает ошибку, если логин занят', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 'u-existing' }] });

      await expect(service.create(dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    const adminRoleId = 'role-admin';
    const userId = 'u1';

    it('обновляет пользователя без смены роли', async () => {
      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ id: userId, role_id: adminRoleId }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          rows: [{ id: userId, first_name: 'Пётр' }],
          rowCount: 1,
        });

      const result = await service.update(
        userId,
        { first_name: 'Пётр' } as any,
        'u-other',
      );

      expect(result).toEqual({ id: userId, first_name: 'Пётр' });
    });

    it('запрещает снимать роль админа с самого себя (п. 10)', async () => {
      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ id: userId, role_id: adminRoleId }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({ rows: [{ id: adminRoleId }] })
        .mockResolvedValueOnce({ rows: [{ role_id: adminRoleId }] });

      await expect(
        service.update(userId, { role_id: 'role-user' } as any, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('бросает 404, если пользователь не найден', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await expect(
        service.update('no-such-id', { first_name: 'X' } as any, 'u-other'),
      ).rejects.toThrow(NotFoundException);
    });

    it('обновляет пароль хешем, а не открытым текстом', async () => {
      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ id: userId, role_id: 'role-user' }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({ rows: [{ id: userId }], rowCount: 1 });

      await service.update(userId, { password: 'new-pass-456' } as any, userId);

      const updateCall = mockPool.query.mock.calls[1];
      expect(updateCall[0]).toContain('password_hash');
      expect(updateCall[1]).not.toContain('new-pass-456');
    });
  });

  describe('softDelete (п. 10)', () => {
    const adminRoleId = 'role-admin';
    const userId = 'u1';

    it('запрещает удалять самого себя', async () => {
      await expect(service.softDelete(userId, userId)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockPool.query).not.toHaveBeenCalled();
    });

    it('запрещает удалять последнего администратора', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ role_id: adminRoleId }] })
        .mockResolvedValueOnce({ rows: [{ id: adminRoleId }] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      await expect(service.softDelete(userId, 'u-other')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('удаляет обычного пользователя', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ role_id: 'role-user' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'role-admin' }] })
        .mockResolvedValueOnce({ rowCount: 1 });

      const result = await service.softDelete(userId, 'u-other');

      expect(result).toEqual({ message: 'Пользователь удален' });
    });

    it('бросает 404, если пользователь не найден', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ role_id: 'role-user' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'role-admin' }] })
        .mockResolvedValueOnce({ rowCount: 0 });

      await expect(
        service.softDelete('no-such-id', 'u-other'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
