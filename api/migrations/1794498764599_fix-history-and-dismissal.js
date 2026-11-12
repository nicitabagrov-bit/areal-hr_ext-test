export const up = (pgm) => {
  // 1. Делаем user_id nullable (пока нет авторизации)
  pgm.sql('ALTER TABLE change_history ALTER COLUMN user_id DROP NOT NULL;');
  
  // 2. Добавляем поле для увольнения
  pgm.addColumn('employees', {
    dismissed_at: { type: 'timestamptz', default: null },
  });
};

export const down = (pgm) => {
  pgm.sql('ALTER TABLE change_history ALTER COLUMN user_id SET NOT NULL;');
  pgm.dropColumn('employees', 'dismissed_at');
};