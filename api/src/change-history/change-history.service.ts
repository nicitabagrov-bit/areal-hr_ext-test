import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class ChangeHistoryService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findAll() {
    const res = await this.pool.query('SELECT * FROM change_history ORDER BY changed_at DESC');
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.pool.query('SELECT * FROM change_history WHERE id = $1', [id]);
    if (res.rowCount === 0) throw new NotFoundException('Record not found');
    return res.rows[0];
  }

  async create(data: any) {
    const res = await this.pool.query(
      'INSERT INTO change_history (user_id, entity_type, entity_id, field_name, old_value, new_value) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [data.user_id, data.entity_type, data.entity_id, data.field_name, data.old_value, data.new_value],
    );
    return res.rows[0];
  }

  async softDelete(id: string) {
    // Журнал не удаляется, поэтому просто возвращаем сообщение
    return { message: 'History cannot be deleted' };
  }
}