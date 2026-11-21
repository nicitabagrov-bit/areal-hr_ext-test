import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { RolesGuard } from '../common/roles.guard.js';
import { Roles } from '../common/roles.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Request() req: any,
    @Body() body: { login: string; password: string },
  ) {
    const user = await this.authService.validateUser(body.login, body.password);
    if (!user) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    // Явно кладём пользователя в сессию — гарантирует Set-Cookie
    await new Promise<void>((resolve, reject) => {
      req.login(user, (err: any) => (err ? reject(err) : resolve()));
    });

    return user;
  }

  @Get('me')
  me(@Request() req: any) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return req.user;
  }

  @UseGuards(AuthGuard('basic'), RolesGuard)
  @Roles('admin')
  @Post('register')
  async register(@Body() body: any) {
    return this.authService.createUser(body);
  }
}
