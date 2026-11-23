import { Injectable, BadRequestException, NotFoundException, Inject, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  // Пункт 4: Создание первого админа
  async onModuleInit() {
    const res = await this.pool.query('SELECT count(*) FROM users');
    if (parseInt(res.rows[0].count) === 0) {
      const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
      // Пункт 15: Явно указываем argon2id
      const hash = await argon2.hash(adminPass, { type: argon2.argon2id });
      
      const adminRole = await this.pool.query("SELECT id FROM roles WHERE name = 'admin'");
      if (adminRole.rows.length > 0) {
        await this.pool.query(
          `INSERT INTO users (last_name, first_name, login, password_hash, role_id) 
           VALUES ('Системный', 'Администратор', 'admin', $1, $2)`,
          [hash, adminRole.rows[0].id]
        );
        console.log('✅ Создан первый администратор. Логин: admin, Пароль:', adminPass);
      }
    }
  }

  async findAll() {
    // Пункт 11: Показываем всех, включая удаленных
    const res = await this.pool.query(`
      SELECT u.id, u.last_name, u.first_name, u.middle_name, u.login, r.name as role_name, u.role_id, u.deleted_at 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);
    return res.rows;
  }

  async create(data: CreateUserDto) {
    const check = await this.pool.query('SELECT id FROM users WHERE login = $1', [data.login]);
    if (check.rows.length > 0) throw new BadRequestException('Пользователь с таким логином уже существует');

    const hash = await argon2.hash(data.password, { type: argon2.argon2id });

    const res = await this.pool.query(
      `INSERT INTO users (last_name, first_name, middle_name, login, password_hash, role_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, last_name, first_name, login, role_id`,
      [data.last_name, data.first_name, data.middle_name || null, data.login, hash, data.role_id]
    );
    return res.rows[0];
  }

  async softDelete(id: string, currentUserId: string) {
    // Пункт 10: Запрет удаления себя
    if (id === currentUserId) {
      throw new BadRequestException('Нельзя удалить самого себя');
    }

    const res = await this.pool.query('UPDATE users SET deleted_at = now() WHERE id = $1 RETURNING id', [id]);
    if (res.rowCount === 0) throw new NotFoundException('Пользователь не найден');
    return { message: 'Пользователь удален' };
  }
}