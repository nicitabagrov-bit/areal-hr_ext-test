export const up = (pgm) => {
  pgm.createTable('hr_operations', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    employee_id: { type: 'uuid', notNull: true, references: 'employees', onDelete: 'CASCADE' },
    department_id: { type: 'uuid', references: 'departments', onDelete: 'SET NULL' },
    position_id: { type: 'uuid', references: 'positions', onDelete: 'SET NULL' },
    operation_type: { type: 'varchar(50)', notNull: true },
    operation_date: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
};

export const down = (pgm) => {
  pgm.dropTable('hr_operations');
};