import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller.js';
// Если у тебя есть сервис RolesService, раскомментируй строку ниже:
// import { RolesService } from './roles.service';

@Module({
  controllers: [RolesController],
  // providers: [RolesService],
})
export class RolesModule {}
