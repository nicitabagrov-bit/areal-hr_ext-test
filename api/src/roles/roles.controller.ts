import { Controller, Get, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Controller('roles')
export class RolesController {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  @Get()
  async findAll() {
    const res = await this.pool.query('SELECT id, name FROM roles ORDER BY name');
    return res.rows;
  }
}
