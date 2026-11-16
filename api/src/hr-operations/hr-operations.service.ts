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
    // 1. Проверка сотрудника (он должен существовать)
    const empCheck = await this.pool.query('SELECT id, dismissed_at, department_id FROM employees WHERE id = $1 AND deleted_at IS NULL', [data.employee_id]);
    if (empCheck.rowCount === 0) throw new BadRequestException('Сотрудник не найден');
    
    const employee = empCheck.rows[0];

    // 2. ЛОГИКА ДЛЯ ПРИЕМА (hire)
    if (data.operation_type === 'hire') {
      if (employee.dismissed_at) {
        throw new BadRequestException('Нельзя принять уже уволенного сотрудника. Сначала восстановите его.');
      }
      if (!data.department_id || !data.position_id) {
        throw new BadRequestException('Для приема на работу обязательны отдел и должность');
      }
      if (!data.salary) {
        throw new BadRequestException('Для приема на работу обязательна зарплата');
      }
      // Обновляем карточку сотрудника
      await this.pool.query(
        'UPDATE employees SET department_id = $1, position_id = $2 WHERE id = $3',
        [data.department_id, data.position_id, data.employee_id]
      );
    }

    // 3. ЛОГИКА ДЛЯ УВОЛЬНЕНИЯ (dismissal)
    if (data.operation_type === 'dismissal') {
      if (!employee.department_id) {
        throw new BadRequestException('Нельзя уволить сотрудника, который не принят на работу');
      }
      await this.pool.query('UPDATE employees SET dismissed_at = now() WHERE id = $1', [data.employee_id]);
    }

    // 4. ЛОГИКА ДЛЯ СМЕНЫ ОТДЕЛА (department_change)
    if (data.operation_type === 'department_change') {
      if (!employee.department_id) {
        throw new BadRequestException('Нельзя сменить отдел непринятому сотруднику');
      }
      if (!data.department_id) {
        throw new BadRequestException('Укажите новый отдел');
      }
      await this.pool.query(
        'UPDATE employees SET department_id = $1 WHERE id = $2',
        [data.department_id, data.employee_id]
      );
    }

    // 5. ЛОГИКА ДЛЯ ИЗМЕНЕНИЯ ЗАРПЛАТЫ (salary_change / salary_set)
    if (data.operation_type === 'salary_change' || data.operation_type === 'salary_set') {
      if (!employee.department_id) {
        throw new BadRequestException('Нельзя изменить зарплату непринятому сотруднику');
      }
      if (!data.salary) {
        throw new BadRequestException('Укажите новую зарплату');
      }
    }

    // 6. Запись самой операции
    const salary = data.salary !== undefined ? data.salary : null;
    const res = await this.pool.query(
      'INSERT INTO hr_operations (employee_id, department_id, position_id, operation_type, salary) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.employee_id, data.department_id || null, data.position_id || null, data.operation_type, salary],
    );

    const created = res.rows[0];

    // 7. Запись в историю
    await this.historyLogger.log({
      entity_type: 'hr_operation',
      entity_id: created.id,
      field_name: 'create',
      new_value: `Создана операция: ${created.operation_type}`,
    });

    if (data.operation_type === 'dismissal') {
      await this.historyLogger.log({
        entity_type: 'employee',
        entity_id: data.employee_id,
        field_name: 'dismissal',
        new_value: 'Уволен',
      });
    }

    return created;
  }

  async update(id: string, data: any) {
    // 1. Получаем текущую операцию
    const opRes = await this.pool.query('SELECT * FROM hr_operations WHERE id = $1 AND deleted_at IS NULL', [id]);
    const operation = opRes.rows[0];
    if (!operation) throw new NotFoundException('Operation not found');

    // 2. Если меняем на увольнение — ставим dismissed_at сотруднику
    if (data.operation_type === 'dismissal' && operation.operation_type !== 'dismissal') {
      await this.pool.query('UPDATE employees SET dismissed_at = now() WHERE id = $1', [operation.employee_id]);
    } 
    // 3. Если меняем с увольнения на что-то другое — снимаем dismissed_at
    else if (operation.operation_type === 'dismissal' && data.operation_type && data.operation_type !== 'dismissal') {
      await this.pool.query('UPDATE employees SET dismissed_at = NULL WHERE id = $1', [operation.employee_id]);
    }

    // 4. Обновляем саму запись операции
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
    // 1. Получаем операцию перед удалением
    const opRes = await this.pool.query('SELECT * FROM hr_operations WHERE id = $1 AND deleted_at IS NULL', [id]);
    const operation = opRes.rows[0];
    if (!operation) throw new NotFoundException('Operation not found');

    // 2. Если удаляем операцию увольнения — восстанавливаем сотрудника
    if (operation.operation_type === 'dismissal') {
      await this.pool.query('UPDATE employees SET dismissed_at = NULL WHERE id = $1', [operation.employee_id]);
    }

    // 3. Мягко удаляем саму операцию
    await this.pool.query('UPDATE hr_operations SET deleted_at = now() WHERE id = $1', [id]);
    
    return { message: 'Operation soft deleted' };
  }
}