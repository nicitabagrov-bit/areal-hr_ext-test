import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PositionsService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findAll() {
    const res = await this.pool.query('SELECT * FROM positions WHERE deleted_at IS NULL');
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.pool.query('SELECT * FROM positions WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rowCount === 0) throw new NotFoundException('Position not found');
    return res.rows[0];
  }

  async create(data: { name: string }) {
    const res = await this.pool.query(
      'INSERT INTO positions (name) VALUES ($1) RETURNING *',
      [data.name],
    );
    return res.rows[0];
  }

  async update(id: string, data: { name?: string }) {
    const res = await this.pool.query(
      'UPDATE positions SET name = $1, updated_at = now() WHERE id = $2 AND deleted_at IS NULL RETURNING *',
      [data.name, id],
    );
    if (res.rowCount === 0) throw new NotFoundException('Position not found');
    return res.rows[0];
  }

  async softDelete(id: string) {
    const res = await this.pool.query(
      'UPDATE positions SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [id],
    );
    if (res.rowCount === 0) throw new NotFoundException('Position not found');
    return { message: 'Position soft deleted' };
  }
}