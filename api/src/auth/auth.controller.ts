import { Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../common/public.decorator.js';

@Controller('auth')
export class AuthController {
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: any) {
    return req.user;
  }

  @Post('logout')
  async logout(@Req() req: any): Promise<{ message: string }> {
    return new Promise((resolve, reject) => {
      req.logout((err: Error | null) => {
        if (err) return reject(err);
        req.session.destroy((destroyErr: Error | null) => {
          if (destroyErr) return reject(destroyErr);
          resolve({ message: 'Выход выполнен' });
        });
      });
    });
  }

  @Get('me')
  async getMe(@Req() req: any) {
    return req.user;
  }
}
