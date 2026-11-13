import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { LocalStrategy } from './local.strategy.js';
import { BasicStrategy } from './basic.strategy.js'; // <-- ДОБАВИТЬ
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, BasicStrategy], // <-- ДОБАВИТЬ BasicStrategy
  exports: [AuthService],
})
export class AuthModule {}