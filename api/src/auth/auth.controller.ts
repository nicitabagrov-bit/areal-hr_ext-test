import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../common/public.decorator.js';

@Controller('auth')
export class AuthController {
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: any): Promise<any> {
    return new Promise((resolve, reject) => {
      req.logIn(req.user, (err: Error | null) => {
        if (err) return reject(err);
        resolve(req.user);
      });
    });
  }

  @Post('logout')
  async logout(@Request() req: any) {
    req.logout(() => {
      req.session.destroy(() => {});
    });
    return { message: 'Logged out' };
  }

  @Get('me')
  async getMe(@Request() req: any) {
    return req.user;
  }
}
