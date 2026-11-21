import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import session from 'express-session';
import passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Бэкенд за прокси Codespaces: без этого express-session
  // с secure: true молча не ставит куку
  app.set('trust proxy', 1);

  app.enableCors({
    origin: 'https://unhallowed-spooky-haunting-jr9v757pvxq4h54p9-5173.app.github.dev',
    credentials: true,
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 1000 * 60 * 60 * 24,
      },
    }),
  );

  passport.serializeUser((user: any, done) => done(null, user));
  passport.deserializeUser((user: any, done) => done(null, user));

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
