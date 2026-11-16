import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseUUIDPipe, 
  BadRequestException 
} from '@nestjs/common';
import { PassportsService } from './passports.service.js';
import { CreatePassportDto } from './dto/create-passport.dto.js';

@Controller('passports')
export class PassportsController {
  constructor(private readonly passportsService: PassportsService) {}

  @Get()
  findAll() {
    return this.passportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.passportsService.findOne(id);
  }

  @Post()
  create(@Body() createPassportDto: CreatePassportDto) {
    // Теперь валидация произойдет автоматически благодаря ValidationPipe в main.ts
    return this.passportsService.create(createPassportDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateDto: any // Для обновления лучше тоже сделать UpdatePassportDto, но пока можно оставить any
  ) {
    return this.passportsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.passportsService.softDelete(id);
  }
}