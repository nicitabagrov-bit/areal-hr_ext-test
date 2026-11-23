import { Injectable, Inject } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { Pool } from 'pg';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(@Inject('PG_POOL') private pool: Pool) {
    super();
  }

  serializeUser(user: any, done: (err: Error | null, user: any) => void): any {
    done(null, user.id);
  }

  async deserializeUser(id: string, done: (err: Error | null, user: any) => void): Promise<any> {
    try {
      const res = await this.pool.query(
        `SELECT u.id, u.login, r.name as role_name 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE u.id = $1 AND u.deleted_at IS NULL`,
        [id]
      );
      
      // Если пользователь не найден (например, удален), возвращаем null
      if (res.rowCount === 0) {
        return done(null, null);
      }
      
      return done(null, res.rows[0]);
    } catch (err) {
      return done(err as Error, null);
    }
  }
}