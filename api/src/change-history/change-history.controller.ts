import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ChangeHistoryService } from './change-history.service.js';

@Controller('change-history')
export class ChangeHistoryController {
  constructor(private readonly changeHistoryService: ChangeHistoryService) {}

  @Get()
  findAll() {
    return this.changeHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.changeHistoryService.findOne(id);
  }

  // МЕТОДЫ @Post() И @Delete() УДАЛЕНЫ!
}