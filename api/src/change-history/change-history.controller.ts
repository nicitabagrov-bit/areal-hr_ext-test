import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ChangeHistoryService } from './change-history.service.js';

@Controller('change-history')
export class ChangeHistoryController {
  constructor(private readonly changeHistoryService: ChangeHistoryService) {}

  @Get()
  findAll() {
    return this.changeHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.changeHistoryService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.changeHistoryService.create(createDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.changeHistoryService.softDelete(id);
  }
}