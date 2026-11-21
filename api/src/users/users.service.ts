import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  // Список всех пользователей (только не удалённые)
  async findAll() {
    const res = await this.pool.query(`
      SELECT u.id, u.last_name, u.first_name, u.middle_name, u.login,
             r.name as role_name, u.role_id, u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.created_at DESC
    `);
    return res.rows;
  }

  // Один пользователь по id (для редактирования на фронте)
  async findOne(id: string) {
    const res = await this.pool.query(
      `
      SELECT u.id, u.last_name, u.first_name, u.middle_name, u.login,
             r.name as role_name, u.role_id, u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1 AND u.deleted_at IS NULL
    `,
      [id],
    );
    if (res.rows.length === 0) throw new NotFoundException('Пользователь не найден');
    return res.rows[0];
  }

  // Создание пользователя
  async create(data: CreateUserDto) {
    // Проверяем, нет ли уже такого логина среди активных пользователей
    const check = await this.pool.query(
      'SELECT id FROM users WHERE login = $1 AND deleted_at IS NULL',
      [data.login],
    );
    if (check.rows.length > 0) {
      throw new BadRequestException('Пользователь с таким логином уже существует');
    }

    // Хэшируем пароль (Argon2id по умолчанию)
    const hash = await argon2.hash(data.password);

    let res;
    try {
      res = await this.pool.query(
        `
        INSERT INTO users (last_name, first_name, middle_name, login, password_hash, role_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, last_name, first_name, middle_name, login, role_id
      `,
        [data.last_name, data.first_name, data.middle_name || null, data.login, hash, data.role_id],
      );
    } catch (e: any) {
      // 23505 — unique_violation в Postgres: логин занят (в т.ч. мягко удалённым пользователем)
      if (e.code === '23505') {
        throw new ConflictException('Пользователь с таким логином уже существует');
      }
      throw e;
    }
    return res.rows[0];
  }

  // Редактирование пользователя
  async update(id: string, data: UpdateUserDto) {
    // 1. Проверяем, что пользователь существует и не удалён
    const check = await this.pool.query(
      'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    if (check.rowCount === 0) throw new NotFoundException('Пользователь не найден');

    // 2. Если меняют логин — проверяем, что он не занят кем-то другим
    if (data.login !== undefined) {
      const dup = await this.pool.query(
        'SELECT id FROM users WHERE login = $1 AND id <> $2 AND deleted_at IS NULL',
        [data.login, id],
      );
      if (dup.rows.length > 0) {
        throw new BadRequestException('Этот логин уже занят');
      }
    }

    // 3. Собираем только те поля, которые реально пришли
    const fields: string[] = [];
    const values: any[] = [];

    if (data.last_name !== undefined) {
      fields.push(`last_name = $${values.length + 1}`);
      values.push(data.last_name);
    }
    if (data.first_name !== undefined) {
      fields.push(`first_name = $${values.length + 1}`);
      values.push(data.first_name);
    }
    if (data.middle_name !== undefined) {
      fields.push(`middle_name = $${values.length + 1}`);
      values.push(data.middle_name);
    }
    if (data.login !== undefined) {
      fields.push(`login = $${values.length + 1}`);
      values.push(data.login);
    }
    if (data.role_id !== undefined) {
      fields.push(`role_id = $${values.length + 1}`);
      values.push(data.role_id);
    }

    // 4. Если пришёл новый пароль — хэшируем
    if (data.password !== undefined) {
      const hash = await argon2.hash(data.password);
      fields.push(`password_hash = $${values.length + 1}`);
      values.push(hash);
    }

    // Нечего обновлять — просто возвращаем пользователя как есть
    if (fields.length === 0) {
      return this.findOne(id);
    }

    // 5. ID идёт последним параметром — под условие WHERE
    values.push(id);

    let res;
    try {
      res = await this.pool.query(
        `
        UPDATE users SET ${fields.join(', ')}
        WHERE id = $${values.length}
        RETURNING id, last_name, first_name, middle_name, login, role_id
      `,
        values,
      );
    } catch (e: any) {
      if (e.code === '23505') {
        throw new ConflictException('Пользователь с таким логином уже существует');
      }
      throw e;
    }
    return res.rows[0];
  }

  // Мягкое удаление
  async softDelete(id: string) {
    const res = await this.pool.query(
      'UPDATE users SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id],
    );
    if (res.rowCount === 0) throw new NotFoundException('Пользователь не найден');
    return { message: 'Пользователь удален' };
  }
}
