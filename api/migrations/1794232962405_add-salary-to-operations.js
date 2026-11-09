export const up = (pgm) => {
  pgm.addColumn('hr_operations', {
    salary: { type: 'numeric(12,2)' },
  });
};

export const down = (pgm) => {
  pgm.dropColumn('hr_operations', 'salary');
};