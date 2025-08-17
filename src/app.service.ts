import { Injectable } from '@nestjs/common'

import { UsersService } from './users/users.service'
import { UserRoles } from './users/entities/user.entity'
import { SettingsService } from './settings/settings.service'
import { RolesService } from './roles/roles.service'

@Injectable()
export class AppService {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  getHello(): string {
    return 'Hello World!'
  }

  async initApplication(): Promise<boolean> {
    await this.rolesService.createRole({ key: 'root_admin', name: 'Головний адміністратор' })
    await this.rolesService.createRole({ key: 'admin', name: 'Адміністратор' })
    await this.rolesService.createRole({ key: 'teacher', name: 'Викладач' })
    await this.rolesService.createRole({ key: 'student', name: 'Студент' })
    await this.rolesService.createRole({ key: 'methodist', name: 'Методист' })
    await this.rolesService.createRole({ key: 'guest', name: 'Гість' })

    const adminRole = await this.rolesService.getByKey('root_admin')

    await this.usersService.create({
      name: 'Root Admin',
      email: 'admin@mail.com',
      password: '11111111',
      role: adminRole,
    })

    await this.settingsService.create({
      callSchedule: {
        '1': {
          start: '08:30',
          end: '9:50',
        },
        '2': {
          start: '10:00',
          end: '11:20',
        },
        '3': {
          start: '12:00',
          end: '13:20',
        },
        '4': {
          start: '13:30',
          end: '14:50',
        },
        '5': {
          start: '15:00',
          end: '16:20',
        },
        '6': {
          start: '16:30',
          end: '17:50',
        },
        '7': {
          start: '18:00',
          end: '19:20',
        },
      },
      firstSemesterStart: '01.09.2024',
      firstSemesterEnd: '20.12.2024',
      secondSemesterEnd: '01.02.2025',
      secondSemesterStart: '30.06.2025',
    })
    return true
  }
}
