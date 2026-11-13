import { Test, TestingModule } from '@nestjs/testing';
import { PassportsService } from './passports.service.js';

describe('PassportsService', () => {
  let service: PassportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PassportsService],
    }).compile();

    service = module.get<PassportsService>(PassportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
