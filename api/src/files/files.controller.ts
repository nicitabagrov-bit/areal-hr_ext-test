import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseInterceptors, 
  UploadedFile, 
  ParseUUIDPipe, 
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service.js';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      // Разрешаем только картинки и PDF (регистр не важен)
      if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/i)) {
        return cb(new BadRequestException('Разрешены только файлы JPG, PNG или PDF'), false);
      }
      cb(null, true);
    }
  }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    // 1. Проверка наличия файла
    if (!file) {
      throw new BadRequestException('Файл обязателен');
    }

    // 2. Проверка employee_id (без isUUID, чтобы не было ложных срабатываний)
    // Сервис сам проверит, есть ли такой сотрудник в базе
    if (!body.employee_id) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new BadRequestException('employee_id обязателен');
    }
    
    // 3. Передача в сервис
    try {
      return await this.filesService.create({
        employee_id: body.employee_id,
        category_id: body.category_id || null,
        name: body.name || file.originalname,
        file_path: file.path,
        mime_type: file.mimetype,
      });
    } catch (error) {
      // Если сервис выдал ошибку (например, сотрудник или категория не найдены) — УДАЛЯЕМ ФАЙЛ
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    return this.filesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.softDelete(id);
  }
}