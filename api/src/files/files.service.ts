import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class FilesService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findAll() {
    const res = await this.pool.query('SELECT * FROM files WHERE deleted_at IS NULL');
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.pool.query('SELECT * FROM files WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rowCount === 0) throw new NotFoundException('File not found');
    return res.rows[0];
  }

  async create(data: any) {
    // 1. Проверка существования сотрудника
    const empCheck = await this.pool.query('SELECT id FROM employees WHERE id = $1 AND deleted_at IS NULL', [data.employee_id]);
    if (empCheck.rowCount === 0) {
      throw new BadRequestException('Employee not found');
    }

    // 2. Проверка категории (если передана)
    if (data.category_id) {
      const catCheck = await this.pool.query('SELECT id FROM file_categories WHERE id = $1 AND deleted_at IS NULL', [data.category_id]);
      if (catCheck.rowCount === 0) {
        throw new BadRequestException('Category not found');
      }
    }

    // 3. Вставка файла
    const res = await this.pool.query(
      'INSERT INTO files (employee_id, category_id, name, file_path, mime_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.employee_id, data.category_id || null, data.name, data.file_path, data.mime_type || null],
    );
    return res.rows[0];
  }

  async update(id: string, data: any) {
    const fields = [];
    const values = [];
    let idx = 1;

    const allowedFields = ['name', 'mime_type'];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${idx++}`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findOne(id);

    values.push(id);
    const query = `UPDATE files SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`;
    
    const res = await this.pool.query(query, values);
    if (res.rowCount === 0) throw new NotFoundException('File not found');
    return res.rows[0];
  }

  async softDelete(id: string) {
    const res = await this.pool.query(
      'UPDATE files SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [id],
    );
    if (res.rowCount === 0) throw new NotFoundException('File not found');
    return { message: 'File soft deleted' };
  }
}