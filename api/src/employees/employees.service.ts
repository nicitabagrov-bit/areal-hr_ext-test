import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class EmployeesService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findAll() {
    const res = await this.pool.query('SELECT * FROM employees WHERE deleted_at IS NULL');
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.pool.query('SELECT * FROM employees WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rowCount === 0) throw new NotFoundException('Employee not found');
    return res.rows[0];
  }

  async create(data: any) {
    const res = await this.pool.query(
      `INSERT INTO employees (
        last_name, first_name, middle_name, birth_date, phone, email,
        passport_series, passport_number, passport_issue_date, passport_department_code, passport_issued_by,
        reg_region, reg_locality, reg_street, reg_house, reg_building, reg_apartment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [
        data.last_name, data.first_name, data.middle_name, data.birth_date, data.phone, data.email,
        data.passport_series, data.passport_number, data.passport_issue_date, data.passport_department_code, data.passport_issued_by,
        data.reg_region, data.reg_locality, data.reg_street, data.reg_house, data.reg_building, data.reg_apartment
      ],
    );
    return res.rows[0];
  }

  async update(id: string, data: any) {
    const fields = [];
    const values = [];
    let idx = 1;

    const allowedFields = [
      'last_name', 'first_name', 'middle_name', 'birth_date', 'phone', 'email',
      'passport_series', 'passport_number', 'passport_issue_date', 'passport_department_code', 'passport_issued_by',
      'reg_region', 'reg_locality', 'reg_street', 'reg_house', 'reg_building', 'reg_apartment'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${idx++}`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findOne(id);

    values.push(id);
    const query = `UPDATE employees SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`;
    
    const res = await this.pool.query(query, values);
    if (res.rowCount === 0) throw new NotFoundException('Employee not found');
    return res.rows[0];
  }

  async softDelete(id: string) {
    const res = await this.pool.query(
      'UPDATE employees SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [id],
    );
    if (res.rowCount === 0) throw new NotFoundException('Employee not found');
    return { message: 'Employee soft deleted' };
  }
}