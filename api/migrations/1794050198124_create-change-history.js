export const up = (pgm) => {
  pgm.createTable('change_history', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true }, // Пока без связи с users, так как их нет
    entity_type: { type: 'varchar(50)', notNull: true },
    entity_id: { type: 'uuid', notNull: true },
    field_name: { type: 'varchar(100)', notNull: true },
    old_value: { type: 'text' },
    new_value: { type: 'text' },
    changed_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
};

export const down = (pgm) => {
  pgm.dropTable('change_history');
};