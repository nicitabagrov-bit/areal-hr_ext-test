export const up = (pgm) => {
  pgm.createTable('addresses', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    employee_id: { type: 'uuid', notNull: true, references: 'employees', onDelete: 'CASCADE' },
    region: { type: 'varchar(255)' },
    city: { type: 'varchar(255)' },
    street: { type: 'varchar(255)' },
    house: { type: 'varchar(20)' },
    building: { type: 'varchar(20)' },
    apartment: { type: 'varchar(20)' },
    deleted_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
};

export const down = (pgm) => {
  pgm.dropTable('addresses');
};