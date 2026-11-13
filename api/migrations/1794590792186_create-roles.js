export const up = (pgm) => {
  pgm.createTable('roles', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(50)', notNull: true, unique: true }, // 'admin', 'hr_manager'
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  
  // Добавляем начальные роли
  pgm.sql(`INSERT INTO roles (name) VALUES ('admin'), ('hr_manager');`);
};

export const down = (pgm) => {
  pgm.dropTable('roles');
};