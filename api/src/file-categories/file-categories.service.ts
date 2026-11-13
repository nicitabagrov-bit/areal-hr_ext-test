import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class FileCategoriesService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findAll() {
    const res = await this.pool.query('SELECT * FROM file_categories WHERE deleted_at IS NULL');
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.pool.query('SELECT * FROM file_categories WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rowCount === 0) throw new NotFoundException('Category not found');
    return res.rows[0];
  }

  async create(data: any) {
    try {
      const res = await this.pool.query(
        'INSERT INTO file_categories (name) VALUES ($1) RETURNING *',
        [data.name],
      );
      return res.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new NotFoundException('Category with this name already exists');
      }
      throw error;
    }
  }

  async update(id: string, data: any) {
    const res = await this.pool.query(
      'UPDATE file_categories SET name = $1, updated_at = now() WHERE id = $2 AND deleted_at IS NULL RETURNING *',
      [data.name, id],
    );
    if (res.rowCount === 0) throw new NotFoundException('Category not found');
    return res.rows[0];
  }

  async softDelete(id: string) {
    const res = await this.pool.query(
      'UPDATE file_categories SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [id],
    );
    if (res.rowCount === 0) throw new NotFoundException('Category not found');
    return { message: 'Category soft deleted' };
  }
}