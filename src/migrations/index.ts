import { InitialSchema1775212875398 } from './1775212875398-InitialSchema'
import { ElectivesSessionAndPlanSubjectElective1789000000000 } from './1789000000000-ElectivesSessionAndPlanSubjectElective'
import { GroupCurator1790200000000 } from './1790200000000-GroupCurator'
/* 
Чи потрібний backend/src/migrations/index.ts?
Для запуску міграцій через CLI (npm run migration:run) — не потрібний. CLI бере міграції напряму з database.config.ts через migrations: ['src/migrations/[0-9]*.ts'].

Він може бути потрібний тільки якщо ви десь у Nest/TypeORM конфігу підключаєте міграції як масив класів (типу migrations: migrations), замість glob-шляху.

Що робити практично
Якщо ви ніде не імпортуєте migrations з src/migrations/index.ts — файл можна сміливо видалити.
Якщо імпортуєте (наприклад у AppModule/конфігу DataSource для рантайму) — тоді залишайте, або переведіть і той конфіг на glob шлях.
Якщо хочеш — скажи, чи ти запускаєш міграції тільки CLI, чи ще й через код при старті Nest, і я підкажу найчистіший варіант.
*/
export const migrations = [
  InitialSchema1775212875398,
  ElectivesSessionAndPlanSubjectElective1789000000000,
  GroupCurator1790200000000,
]