export const up = (pgm) => {
  pgm.sql(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_login_key`);
  pgm.sql(`CREATE UNIQUE INDEX users_login_unique_idx ON users (login) WHERE deleted_at IS NULL`);
};

export const down = (pgm) => {
  pgm.sql(`DROP INDEX IF EXISTS users_login_unique_idx`);
  pgm.sql(`ALTER TABLE users ADD CONSTRAINT users_login_key UNIQUE (login)`);
};
