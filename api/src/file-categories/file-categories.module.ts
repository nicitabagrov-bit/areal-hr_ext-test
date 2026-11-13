import { Module } from '@nestjs/common';
import { FileCategoriesService } from './file-categories.service.js';
import { FileCategoriesController } from './file-categories.controller.js';

@Module({
  controllers: [FileCategoriesController],
  providers: [FileCategoriesService],
})
export class FileCategoriesModule {}
