import { Module } from '@nestjs/common';
import { ChangeHistoryService } from './change-history.service.js';
import { ChangeHistoryController } from './change-history.controller.js';

@Module({
  controllers: [ChangeHistoryController],
  providers: [ChangeHistoryService],
})
export class ChangeHistoryModule {}
