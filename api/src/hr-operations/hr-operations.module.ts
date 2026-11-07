import { Module } from '@nestjs/common';
import { HrOperationsService } from './hr-operations.service.js';
import { HrOperationsController } from './hr-operations.controller.js';

@Module({
  controllers: [HrOperationsController],
  providers: [HrOperationsService],
})
export class HrOperationsModule {}
