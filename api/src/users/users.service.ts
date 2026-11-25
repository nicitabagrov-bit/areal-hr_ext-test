import { Injectable, BadRequestException, NotFoundException, Inject, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  // Пункт 4: Создание первого админа при старте, если база пустая
  async onModuleInit() {
    const res = await this.pool.query('SELECT count(*) FROM users');
    if (parseInt(res.rows[0].count) === 0) {
      const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
      // Пункт 15: Явно указываем argon2id
      const hash = await argon2.hash(adminPass, { type: argon2.argon2id });
      
      const adminRole = await this.pool.query("SELECT id FROM roles WHERE name = 'admin'");
      if (adminRole.rowCount && adminRole.rowCount > 0) {
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

  async update(id: string, data: any, currentUserId: string) {

    const check = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (check.rowCount === 0) throw new NotFoundException('Пользователь не найден');


    if (data.role_id) {
       const adminRole = await this.pool.query("SELECT id FROM roles WHERE name = 'admin'");
       const currentUser = await this.pool.query('SELECT role_id FROM users WHERE id = $1', [currentUserId]);
       
       if (id === currentUserId && data.role_id !== adminRole.rows[0].id && currentUser.rows[0].role_id === adminRole.rows[0].id) {
           throw new BadRequestException('Нельзя снять с себя роль администратора');
       }
    }

    const fields = [];
    const values = [];
    let idx = 1;

    const allowedFields = ['last_name', 'first_name', 'middle_name', 'role_id'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${idx++}`);
        values.push(data[field]);
      }
    }

   
    if (data.password) {
      const hash = await argon2.hash(data.password, { type: argon2.argon2id });
      fields.push(`password_hash = $${idx++}`);
      values.push(hash);
    }

    if (fields.length === 0) return check.rows[0];

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING id, last_name, first_name, login, role_id`;
    
    const res = await this.pool.query(query, values);
    return res.rows[0];
  }


  async softDelete(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException('Нельзя удалить самого себя');
    }

    const userToDelete = await this.pool.query('SELECT role_id FROM users WHERE id = $1', [id]);
    const adminRole = await this.pool.query("SELECT id FROM roles WHERE name = 'admin'");
    
    if (userToDelete.rows[0]?.role_id === adminRole.rows[0]?.id) {
      const adminsCount = await this.pool.query(
        "SELECT count(*) FROM users WHERE role_id = $1 AND deleted_at IS NULL", 
        [adminRole.rows[0].id]
      );
      if (parseInt(adminsCount.rows[0].count) <= 1) {
        throw new BadRequestException('Нельзя удалить последнего администратора');
      }
    }

    const res = await this.pool.query('UPDATE users SET deleted_at = now() WHERE id = $1 RETURNING id', [id]);
    if (res.rowCount === 0) throw new NotFoundException('Пользователь не найден');
    return { message: 'Пользователь удален' };
  }
}