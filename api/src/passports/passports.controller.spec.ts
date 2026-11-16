import { Test, TestingModule } from '@nestjs/testing';
import { PassportsController } from './passports.controller.js';
import { PassportsService } from './passports.service.js';
import { vi } from 'vitest';

describe('PassportsController', () => {
  let controller: PassportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassportsController],
      providers: [
        {
          provide: PassportsService,
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

    controller = module.get<PassportsController>(PassportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});