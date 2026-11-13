import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Pool } from 'pg';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async validateUser(login: string, pass: string): Promise<any> {
    const res = await this.pool.query(
      'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.login = $1 AND u.deleted_at IS NULL',
      [login],
    );
    
    const user = res.rows[0];
    if (user && await argon2.verify(user.password_hash, pass)) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async createUser(data: any) {
    const hash = await argon2.hash(data.password);
    const roleRes = await this.pool.query('SELECT id FROM roles WHERE name = $1', [data.role_name]);
    if (roleRes.rowCount === 0) {
      throw new UnauthorizedException('Role not found');
    }

    const res = await this.pool.query(
      'INSERT INTO users (last_name, first_name, middle_name, login, password_hash, role_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, last_name, first_name, login',
      [data.last_name, data.first_name, data.middle_name, data.login, hash, roleRes.rows[0].id],
    );
    return res.rows[0];
  }
}