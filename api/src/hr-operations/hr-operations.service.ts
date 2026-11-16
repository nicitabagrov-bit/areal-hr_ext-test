import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { HistoryLogger } from '../change-history/history-logger.service.js';

@Injectable()
export class HrOperationsService {
  constructor(
    @Inject('PG_POOL') private pool: Pool,
    private historyLogger: HistoryLogger,
  ) {}

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
    const { employee_id, operation_type, department_id, position_id, salary } = data;

    // 1. Проверка сотрудника
    const empCheck = await this.pool.query(
      'SELECT id, dismissed_at, department_id FROM employees WHERE id = $1 AND deleted_at IS NULL', 
      [employee_id]
    );
    const employee = empCheck.rows[0];
    if (!employee) throw new BadRequestException('Сотрудник не найден');

    // 2. ЛОГИКА ДЛЯ ПРИЕМА НА РАБОТУ (hire)
    if (operation_type === 'hire') {
      if (employee.dismissed_at) {
        throw new BadRequestException('Нельзя принять уже уволенного сотрудника. Сначала восстановите его.');
      }
      if (!department_id || !position_id) {
        throw new BadRequestException('Для приема на работу обязательны отдел и должность');
      }
      if (!salary) {
        throw new BadRequestException('Для приема на работу обязательна зарплата');
      }
      await this.pool.query(
        'UPDATE employees SET department_id = $1, position_id = $2, dismissed_at = NULL WHERE id = $3',
        [department_id, position_id, employee_id]
      );
    }

    // 3. ЛОГИКА ДЛЯ УВОЛЬНЕНИЯ (dismissal)
    if (operation_type === 'dismissal') {
      if (!employee.department_id) {
        throw new BadRequestException('Нельзя уволить сотрудника, который не принят на работу');
      }
      await this.pool.query('UPDATE employees SET dismissed_at = now() WHERE id = $1', [employee_id]);
    }

    // 4. ЛОГИКА ДЛЯ СМЕНЫ ОТДЕЛА (department_change)
    if (operation_type === 'department_change') {
      if (!employee.department_id) {
        throw new BadRequestException('Нельзя сменить отдел непринятому сотруднику');
      }
      if (!department_id) {
        throw new BadRequestException('Укажите новый отдел');
      }
      await this.pool.query(
        'UPDATE employees SET department_id = $1 WHERE id = $2',
        [department_id, employee_id]
      );
    }

    // 5. ЛОГИКА ДЛЯ ИЗМЕНЕНИЯ ЗАРПЛАТЫ (salary_change / salary_set)
    if (operation_type === 'salary_change' || operation_type === 'salary_set') {
      if (!employee.department_id) {
        throw new BadRequestException('Нельзя изменить зарплату непринятому сотруднику. Сначала примите его на работу.');
      }
      if (!salary) {
        throw new BadRequestException('Укажите новую зарплату');
      }
    }

    // 6. Запись самой операции
    const result = await this.pool.query(
      `INSERT INTO hr_operations (employee_id, operation_type, department_id, position_id, salary, created_at) 
       VALUES ($1, $2, $3, $4, $5, now()) RETURNING *`,
      [employee_id, operation_type, department_id || null, position_id || null, salary || null]
    );

    // 7. Запись в историю (ТОЛЬКО entity_id и field_name, БЕЗ department_id!)
    const created = result.rows[0];
    await this.historyLogger.log({
      entity_type: 'hr_operation',
      entity_id: created.id,
      field_name: 'create',
      new_value: `Создана операция: ${created.operation_type}`,
    });

    if (operation_type === 'dismissal') {
      await this.historyLogger.log({
        entity_type: 'employee',
        entity_id: employee_id,
        field_name: 'dismissal',
        new_value: 'Уволен',
      });
    }

    return created;
  }

  async update(id: string, data: any) {
    const opRes = await this.pool.query('SELECT * FROM hr_operations WHERE id = $1 AND deleted_at IS NULL', [id]);
    const operation = opRes.rows[0];
    if (!operation) throw new NotFoundException('Operation not found');

    if (data.operation_type === 'dismissal' && operation.operation_type !== 'dismissal') {
      await this.pool.query('UPDATE employees SET dismissed_at = now() WHERE id = $1', [operation.employee_id]);
    } 
    else if (operation.operation_type === 'dismissal' && data.operation_type && data.operation_type !== 'dismissal') {
      await this.pool.query('UPDATE employees SET dismissed_at = NULL WHERE id = $1', [operation.employee_id]);
    }

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
    const opRes = await this.pool.query('SELECT * FROM hr_operations WHERE id = $1 AND deleted_at IS NULL', [id]);
    const operation = opRes.rows[0];
    if (!operation) throw new NotFoundException('Operation not found');

    if (operation.operation_type === 'dismissal') {
      await this.pool.query('UPDATE employees SET dismissed_at = NULL WHERE id = $1', [operation.employee_id]);
    }

    await this.pool.query('UPDATE hr_operations SET deleted_at = now() WHERE id = $1', [id]);
    return { message: 'Operation soft deleted' };
  }
}