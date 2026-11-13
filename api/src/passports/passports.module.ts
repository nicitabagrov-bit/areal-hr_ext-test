import { Module } from '@nestjs/common';
import { PassportsService } from './passports.service.js';
import { PassportsController } from './passports.controller.js';

@Module({
  controllers: [PassportsController],
  providers: [PassportsService],
})
export class PassportsModule {}
