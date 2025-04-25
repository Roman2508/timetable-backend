import { Injectable } from '@nestjs/common';
import { SettingsService } from './settings/settings.service';
import { UsersService } from './users/users.service';
import { UserRoles } from './users/entities/user.entity';

@Injectable()
export class AppService {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly usersService: UsersService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }
  async initApplication(): Promise<boolean> {
    await this.usersService.create({ email: 'admin@mail.com', password: '11111111', role: UserRoles.ADMIN });
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
    });
    return true;
  }
}
