import { Inject, Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Pool } from 'pg';
import { HistoryLogger } from '../change-history/history-logger.service.js';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject('PG_POOL') private pool: Pool,
    private historyLogger: HistoryLogger,
  ) {}

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
    if (new Date(data.birth_date) > new Date()) {
      throw new BadRequestException('Дата рождения не может быть в будущем');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const res = await client.query(
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
      
      const created = res.rows[0];

      await this.historyLogger.log({
        entity_type: 'employee',
        entity_id: created.id,
        field_name: 'create',
        new_value: `Создан сотрудник: ${created.last_name} ${created.first_name}`,
      });

      await client.query('COMMIT');
      return created;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id: string, data: any) {
    // Запрет на обнуление обязательных полей
    if (data.last_name === null) throw new BadRequestException('Фамилия не может быть пустой');
    if (data.first_name === null) throw new BadRequestException('Имя не может быть пустым');
    if (data.birth_date === null) throw new BadRequestException('Дата рождения не может быть пустой');

    // Проверка: если сотрудник уволен, редактировать нельзя
    const check = await this.pool.query('SELECT dismissed_at FROM employees WHERE id = $1', [id]);
    if (check.rows[0]?.dismissed_at) {
      throw new ForbiddenException('Нельзя редактировать уволенного сотрудника');
    }

    if (data.birth_date !== undefined && new Date(data.birth_date) > new Date()) {
      throw new BadRequestException('Дата рождения не может быть в будущем');
    }

    const oldRes = await this.pool.query('SELECT * FROM employees WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (oldRes.rowCount === 0) throw new NotFoundException('Employee not found');
    const oldData = oldRes.rows[0];

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
    const updated = res.rows[0];

    // Запись в историю для каждого измененного поля (с корректным сравнением дат)
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        // Приводим оба значения к строке, чтобы корректно сравнивать Date и string
        const oldVal = oldData[field] ? String(oldData[field]) : '';
        const newVal = data[field] ? String(data[field]) : '';
        
        // Для дат сравниваем только часть YYYY-MM-DD, чтобы не ловить разницу в часовых поясах
        let isChanged = oldVal !== newVal;
        if (field === 'birth_date' || field === 'passport_issue_date') {
          isChanged = oldVal.split('T')[0] !== newVal.split('T')[0];
        }

        if (isChanged) {
          await this.historyLogger.log({
            entity_type: 'employee',
            entity_id: id,
            field_name: field,
            old_value: oldVal,
            new_value: newVal,
          });
        }
      }
    }

    return updated;
  }

  async softDelete(id: string) {
    const res = await this.pool.query(
      'UPDATE employees SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [id],
    );
    if (res.rowCount === 0) throw new NotFoundException('Employee not found');
    
    const deleted = res.rows[0];

    await this.historyLogger.log({
      entity_type: 'employee',
      entity_id: id,
      field_name: 'delete',
      old_value: `Сотрудник: ${deleted.last_name} ${deleted.first_name}`,
      new_value: 'Удален',
    });

    return { message: 'Employee soft deleted' };
  }
}