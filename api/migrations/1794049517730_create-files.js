export const up = (pgm) => {
  pgm.createTable('files', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    employee_id: { type: 'uuid', notNull: true, references: 'employees', onDelete: 'CASCADE' },
    name: { type: 'varchar(255)', notNull: true },
    file_path: { type: 'varchar(500)', notNull: true },
    mime_type: { type: 'varchar(100)' },
    deleted_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
};

export const down = (pgm) => {
  pgm.dropTable('files');
};