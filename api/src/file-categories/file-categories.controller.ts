import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { FileCategoriesService } from './file-categories.service.js';

@Controller('file-categories')
export class FileCategoriesController {
  constructor(private readonly fileCategoriesService: FileCategoriesService) {}

  @Get()
  findAll() {
    return this.fileCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fileCategoriesService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.fileCategoriesService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    return this.fileCategoriesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.fileCategoriesService.softDelete(id);
  }
}