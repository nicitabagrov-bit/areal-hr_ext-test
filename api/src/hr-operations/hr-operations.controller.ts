import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HrOperationsService } from './hr-operations.service.js';

@Controller('hr-operations')
export class HrOperationsController {
  constructor(private readonly hrOperationsService: HrOperationsService) {}

  @Get()
  findAll() {
    return this.hrOperationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hrOperationsService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.hrOperationsService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.hrOperationsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hrOperationsService.softDelete(id);
  }
}