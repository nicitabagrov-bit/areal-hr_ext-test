export const up = (pgm) => {
  pgm.createTable('employees', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    last_name: { type: 'varchar(100)', notNull: true },
    first_name: { type: 'varchar(100)', notNull: true },
    middle_name: { type: 'varchar(100)' },
    birth_date: { type: 'date', notNull: true },
    phone: { type: 'varchar(20)' },
    email: { type: 'varchar(100)' },
    
    // Паспортные данные
    passport_series: { type: 'varchar(4)' },
    passport_number: { type: 'varchar(6)' },
    passport_issue_date: { type: 'date' },
    passport_department_code: { type: 'varchar(7)' },
    passport_issued_by: { type: 'varchar(255)' },
    
    // Адрес регистрации
    reg_region: { type: 'varchar(255)' },
    reg_locality: { type: 'varchar(255)' },
    reg_street: { type: 'varchar(255)' },
    reg_house: { type: 'varchar(20)' },
    reg_building: { type: 'varchar(20)' },
    reg_apartment: { type: 'varchar(20)' },

    deleted_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
};

export const down = (pgm) => {
  pgm.dropTable('employees');
};