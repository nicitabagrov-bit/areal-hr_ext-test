import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'PG_POOL',
      useFactory: (configService: ConfigService) =>
        new Pool({
          connectionString: configService.get<string>('DATABASE_URL'),
        },
      ),
      inject: [ConfigService],
    },
  ],
  exports: ['PG_POOL'],
})
export class DatabaseModule {}
