import { Module } from '@nestjs/common';
import { ChangeHistoryService } from './change-history.service.js';
import { ChangeHistoryController } from './change-history.controller.js';
import { HistoryLogger } from './history-logger.service.js';

@Module({
  controllers: [ChangeHistoryController],
  providers: [ChangeHistoryService, HistoryLogger],
  exports: [HistoryLogger], // Экспортируем, чтобы использовать в других модулях
})
export class ChangeHistoryModule {}