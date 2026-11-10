import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class HistoryLogger {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async log(data: {
    user_id?: string;
    entity_type: string;
    entity_id: string;
    field_name: string;
    old_value?: string;
    new_value?: string;
  }) {
    await this.pool.query(
      'INSERT INTO change_history (user_id, entity_type, entity_id, field_name, old_value, new_value) VALUES ($1, $2, $3, $4, $5, $6)',
      [data.user_id || null, data.entity_type, data.entity_id, data.field_name, data.old_value || null, data.new_value || null],
    );
  }
}