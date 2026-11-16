import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'PG_POOL',
      useFactory: () => {
        console.log('🔥 DatabaseModule: ЖЕСТКОЕ ПОДКЛЮЧЕНИЕ К БАЗЕ (hr_user)');
        
        // Жестко прописываем параметры, игнорируя .env и системные переменные
        return new Pool({
          host: 'localhost',
          port: 5432,
          user: 'hr_user',
          password: 'your_secure_password',
          database: 'hr_db',
        });
      },
    },
  ],
  exports: ['PG_POOL'],
})
export class DatabaseModule {}