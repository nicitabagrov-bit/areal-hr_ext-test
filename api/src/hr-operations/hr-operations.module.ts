import { Module } from '@nestjs/common';
import { HrOperationsService } from './hr-operations.service.js';
import { HrOperationsController } from './hr-operations.controller.js';
import { ChangeHistoryModule } from '../change-history/change-history.module.js'; 

@Module({
  imports: [ChangeHistoryModule], 
  controllers: [HrOperationsController],
  providers: [HrOperationsService],
})
export class HrOperationsModule {}