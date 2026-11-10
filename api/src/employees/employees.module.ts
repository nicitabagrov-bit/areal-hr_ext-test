import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service.js';
import { EmployeesController } from './employees.controller.js';
import { ChangeHistoryModule } from '../change-history/change-history.module.js'; // <-- ДОБАВИТЬ

@Module({
  imports: [ChangeHistoryModule], // <-- ДОБАВИТЬ
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}