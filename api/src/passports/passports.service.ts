import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PassportsService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findAll() {
    const res = await this.pool.query('SELECT * FROM passports WHERE deleted_at IS NULL');
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.pool.query('SELECT * FROM passports WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rowCount === 0) throw new NotFoundException('Passport not found');
    return res.rows[0];
  }

  async create(data: any) {
    // Проверка существования сотрудника
    const empCheck = await this.pool.query('SELECT id FROM employees WHERE id = $1 AND deleted_at IS NULL', [data.employee_id]);
    if (empCheck.rowCount === 0) {
      throw new NotFoundException('Employee not found');
    }

    const res = await this.pool.query(
      'INSERT INTO passports (employee_id, series, number, issue_date, department_code, issued_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [data.employee_id, data.series, data.number, data.issue_date, data.department_code, data.issued_by],
    );
    return res.rows[0];
  }

  async update(id: string, data: any) {
    const fields = [];
    const values = [];
    let idx = 1;

    const allowedFields = ['series', 'number', 'issue_date', 'department_code', 'issued_by'];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${idx++}`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findOne(id);

    values.push(id);
    const query = `UPDATE passports SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`;
    
    const res = await this.pool.query(query, values);
    if (res.rowCount === 0) throw new NotFoundException('Passport not found');
    return res.rows[0];
  }

  async softDelete(id: string) {
    const res = await this.pool.query(
      'UPDATE passports SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [id],
    );
    if (res.rowCount === 0) throw new NotFoundException('Passport not found');
    return { message: 'Passport soft deleted' };
  }
}