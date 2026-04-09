import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { register } from 'tsconfig-paths'

register({ baseUrl: './', paths: { 'src/*': ['src/*'] } })

dotenv.config()
// Використовується для міграцій
// TODO: В майбутньому бажано зробити спільний конфіг БД для nest-js та міграцій typeorm (зараз є окремо конфігурація в app.module.ts та database.config.ts)
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  // Важливо: у `src/migrations/index.ts` експортується масив `migrations`,
  // а TypeORM під час сканування директорії "розгортає" масиви експортів,
  // що призводить до дублювання міграцій. Тому скануємо лише файли з таймстемпом.
  migrations: ['src/migrations/[0-9]*.ts'],
  synchronize: false,
  ssl: { rejectUnauthorized: false },
})
