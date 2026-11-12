import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    // 1. Проверяем, существует ли организация (и не удалена)
    const orgCheck = await this.pool.query('SELECT id FROM organizations WHERE id = $1 AND deleted_at IS NULL', [data.organization_id]);
    if (orgCheck.rowCount === 0) {
      throw new BadRequestException('Organization not found');
    }

    // 2. Проверяем родителя (если передан)
    if (data.parent_id) {
      const parentCheck = await this.pool.query('SELECT id FROM departments WHERE id = $1 AND deleted_at IS NULL', [data.parent_id]);
      if (parentCheck.rowCount === 0) {
        throw new BadRequestException('Parent department not found');
      }
    }

    const res = await this.pool.query(
      'INSERT INTO departments (name, comment, organization_id, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.name, data.comment, data.organization_id, data.parent_id || null],
    );
    return res.rows[0];
  }

  async update(id: string, data: any) {
    // Проверка на цикл (упрощенная)
    if (data.parent_id) {
      if (data.parent_id === id) {
        throw new BadRequestException('Department cannot be its own parent');
      }

      let currentParentId = data.parent_id;
      while (currentParentId) {
        if (currentParentId === id) {
          throw new BadRequestException('Cycle detected in department hierarchy');
        }
        const res = await this.pool.query('SELECT parent_id FROM departments WHERE id = $1', [currentParentId]);
        if (res.rowCount === 0) break;
        currentParentId = res.rows[0]?.parent_id || null;
      }
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
    if (data.comment !== undefined) { fields.push(`comment = $${idx++}`); values.push(data.comment); }
    if (data.organization_id !== undefined) { fields.push(`organization_id = $${idx++}`); values.push(data.organization_id); }
    if (data.parent_id !== undefined) { fields.push(`parent_id = $${idx++}`); values.push(data.parent_id); }

    if (fields.length === 0) return this.findOne(id);

    values.push(id);
    const query = `UPDATE departments SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`;
    
    try {
      const res = await this.pool.query(query, values);
      if (res.rowCount === 0) throw new NotFoundException('Department not found');
      return res.rows[0];
    } catch (error: any) {
      if (error.code === '23503') {
        throw new BadRequestException('Cycle detected in department hierarchy');
      }
      throw error;
    }
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