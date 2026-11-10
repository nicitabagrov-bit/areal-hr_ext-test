import { Module } from '@nestjs/common';
import { ChangeHistoryService } from './change-history.service.js';
import { ChangeHistoryController } from './change-history.controller.js';
import { HistoryLogger } from './history-logger.service.js';
import { DatabaseModule } from '../database.module.js';

@Module({
  imports: [DatabaseModule], // <-- ДОЛЖНО БЫТЬ
  controllers: [ChangeHistoryController],
  providers: [ChangeHistoryService, HistoryLogger],
  exports: [HistoryLogger],
})
export class ChangeHistoryModule {}