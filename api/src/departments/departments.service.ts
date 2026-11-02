import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DepartmentsService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findAll() {
    const res = await this.pool.query('SELECT * FROM departments WHERE deleted_at IS NULL');
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.pool.query('SELECT * FROM departments WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rowCount === 0) throw new NotFoundException('Department not found');
    return res.rows[0];
  }

  async create(data: { name: string; comment?: string; organization_id: string; parent_id?: string }) {
    const res = await this.pool.query(
      'INSERT INTO departments (name, comment, organization_id, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.name, data.comment, data.organization_id, data.parent_id || null],
    );
    return res.rows[0];
  }

  async update(id: string, data: any) {
    const res = await this.pool.query(
      'UPDATE departments SET name = $1, comment = $2, organization_id = $3, parent_id = $4, updated_at = now() WHERE id = $5 AND deleted_at IS NULL RETURNING *',
      [data.name, data.comment, data.organization_id, data.parent_id, id],
    );
    if (res.rowCount === 0) throw new NotFoundException('Department not found');
    return res.rows[0];
  }

  async softDelete(id: string) {
    const res = await this.pool.query(
      'UPDATE departments SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [id],
    );
    if (res.rowCount === 0) throw new NotFoundException('Department not found');
    return { message: 'Department soft deleted' };
  }
}