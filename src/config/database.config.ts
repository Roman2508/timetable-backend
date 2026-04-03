import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { register } from 'tsconfig-paths'

register({ baseUrl: './', paths: { 'src/*': ['src/*'] } })

dotenv.config()

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  ssl: { rejectUnauthorized: false },
})
