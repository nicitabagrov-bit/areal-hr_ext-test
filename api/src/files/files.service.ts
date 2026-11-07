import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
    const res = await this.pool.query(
      'INSERT INTO files (employee_id, name, file_path, mime_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.employee_id, data.name, data.file_path, data.mime_type || null],
    );
    return res.rows[0];
  }

  async update(id: string, data: any) {
    const fields = [];
    const values = [];
    let idx = 1;

    // Убрали category_id, так как этой колонки нет в базе
    const allowedFields = ['name', 'file_path', 'mime_type'];

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