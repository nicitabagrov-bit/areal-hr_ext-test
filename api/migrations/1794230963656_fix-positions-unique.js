export const up = (pgm) => {
  // Удаляем старый уникальный индекс, если он есть
  pgm.dropConstraint('positions', 'positions_name_key', { ifExists: true });
  // Создаем новый частичный индекс (только для неудаленных)
  pgm.createIndex('positions', 'name', {
    unique: true,
    where: 'deleted_at IS NULL',
  });
};

export const down = (pgm) => {
  pgm.dropIndex('positions', 'name', { unique: true, where: 'deleted_at IS NULL' });
  pgm.addConstraint('positions', 'positions_name_key', { unique: 'name' });
};