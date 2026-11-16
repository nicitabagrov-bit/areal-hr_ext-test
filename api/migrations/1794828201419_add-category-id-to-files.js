export const up = (pgm) => {
  pgm.addColumn('files', {
    category_id: {
      type: 'uuid',
      references: 'file_categories',
      onDelete: 'SET NULL', // Если категорию удалят, у файла станет null
    },
  });
};

export const down = (pgm) => {
  pgm.dropColumn('files', 'category_id');
};cd 