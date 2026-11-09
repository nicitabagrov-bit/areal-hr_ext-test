import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { HrOperationsService } from './hr-operations.service.js';
import { CreateHrOperationDto } from './dto/create-hr-operation.dto.js';
import { UpdateHrOperationDto } from './dto/update-hr-operation.dto.js';

@Controller('hr-operations')
export class HrOperationsController {
  constructor(private readonly hrOperationsService: HrOperationsService) {}

  @Get()
  findAll() {
    return this.hrOperationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrOperationsService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateHrOperationDto) {
    return this.hrOperationsService.create(createDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateHrOperationDto,
  ) {
    return this.hrOperationsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrOperationsService.softDelete(id);
  }
}