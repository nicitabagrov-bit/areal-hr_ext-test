import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class HrOperationsService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findAll() {
    const res = await this.pool.query('SELECT * FROM hr_operations WHERE deleted_at IS NULL');
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.pool.query('SELECT * FROM hr_operations WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rowCount === 0) throw new NotFoundException('Operation not found');
    return res.rows[0];
  }

  async create(data: any) {
    // 1. Проверка сотрудника
    const empCheck = await this.pool.query('SELECT id FROM employees WHERE id = $1 AND deleted_at IS NULL', [data.employee_id]);
    if (empCheck.rowCount === 0) throw new BadRequestException('Employee not found');

    // 2. Проверка отдела (если передан)
    if (data.department_id) {
      const depCheck = await this.pool.query('SELECT id FROM departments WHERE id = $1 AND deleted_at IS NULL', [data.department_id]);
      if (depCheck.rowCount === 0) throw new BadRequestException('Department not found');
    }

    // 3. Проверка должности (если передана)
    if (data.position_id) {
      const posCheck = await this.pool.query('SELECT id FROM positions WHERE id = $1 AND deleted_at IS NULL', [data.position_id]);
      if (posCheck.rowCount === 0) throw new BadRequestException('Position not found');
    }

    // 4. Исправляем salary || null (чтобы 0 сохранялся как 0, а не превращался в null)
    const salary = data.salary !== undefined ? data.salary : null;

    const res = await this.pool.query(
      'INSERT INTO hr_operations (employee_id, department_id, position_id, operation_type, salary) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.employee_id, data.department_id || null, data.position_id || null, data.operation_type, salary],
    );
    return res.rows[0];
  }

  async update(id: string, data: any) {
    const fields = [];
    const values = [];
    let idx = 1;

    const allowedFields = ['department_id', 'position_id', 'operation_type', 'salary'];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${idx++}`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findOne(id);

    values.push(id);
    const query = `UPDATE hr_operations SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`;
    
    const res = await this.pool.query(query, values);
    if (res.rowCount === 0) throw new NotFoundException('Operation not found');
    return res.rows[0];
  }

  async softDelete(id: string) {
    const res = await this.pool.query(
      'UPDATE hr_operations SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [id],
    );
    if (res.rowCount === 0) throw new NotFoundException('Operation not found');
    return { message: 'Operation soft deleted' };
  }
}