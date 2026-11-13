export const up = (pgm) => {
  pgm.createTable('passports', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    employee_id: { type: 'uuid', notNull: true, references: 'employees', onDelete: 'CASCADE' },
    series: { type: 'varchar(4)', notNull: true },
    number: { type: 'varchar(6)', notNull: true },
    issue_date: { type: 'date', notNull: true },
    department_code: { type: 'varchar(7)' },
    issued_by: { type: 'varchar(255)' },
    deleted_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
};

export const down = (pgm) => {
  pgm.dropTable('passports');
};