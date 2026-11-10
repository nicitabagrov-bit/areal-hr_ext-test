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
import * as fs from 'fs'; // <-- Для удаления файла

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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 МБ
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/i)) { // <-- флаг i (регистр)
        return cb(new BadRequestException('Only image and PDF files are allowed'), false);
      }
      cb(null, true);
    }
  }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    
    try {
      return await this.filesService.create({
        employee_id: body.employee_id,
        name: body.name || file.originalname,
        file_path: file.path,
        mime_type: file.mimetype,
      });
    } catch (error) {
      // Если сервис выдал ошибку (сотрудник не найден или база упала), удаляем файл
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