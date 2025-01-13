const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

import { google } from 'googleapis';
import { Repository } from 'typeorm';
import { JWT } from 'google-auth-library';
import { InjectRepository } from '@nestjs/typeorm';
import { customDayjs } from 'src/utils/customDayjs';
import { authenticate } from '@google-cloud/local-auth';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { GroupEntity } from 'src/groups/entities/group.entity';
import { FindCalendarEventDto } from './dto/find-calendar-event.dto';
import { TeacherEntity } from 'src/teachers/entities/teacher.entity';
import { SettingsEntity } from 'src/settings/entities/setting.entity';
import { CreateGoogleCalendarDto } from './dto/create-google-calendar.dto';
import { UpdateGoogleCalendarDto } from './dto/update-google-calendar.dto';
import { DeleteGoogleCalendarDto } from './dto/delete-google-calendar.dto';
import { UpdateGoogleCalendarEventDto } from './dto/update-google-calendar-event.dto';
import { CreateGoogleCalendarEventDto } from './dto/create-google-calendar-event.dto';
import { GoogleAuth, JSONClient } from 'google-auth-library/build/src/auth/googleauth';

const TOKEN_PATH = path.join(process.cwd(), 'src/google-calendar/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'src/google-calendar/client_secret.json');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/meetings',
  'https://www.googleapis.com/auth/meetings.space.created',
];
const KEY_FILE = path.join(process.cwd(), 'src/google-calendar/service-account-key.json');

@Injectable()
export class GoogleCalendarService {
  private googleClient: any;

  constructor(
    @InjectRepository(SettingsEntity)
    private settingsRepository: Repository<SettingsEntity>,

    @InjectRepository(TeacherEntity)
    private teacherRepository: Repository<TeacherEntity>,

    @InjectRepository(GroupEntity)
    private groupRepository: Repository<GroupEntity>,
  ) {
    const key = JSON.parse(fsSync.readFileSync(KEY_FILE, 'utf8'));

    const client = new JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: SCOPES,
      subject: 'admin.calendar@pharm.zt.ua',
    });

    // @ts-ignore
    this.googleClient = google.calendar({ version: 'v3', auth: client });
  }

  // auth
  // ???????????????????????????????????????????????????????????
  // async loadSavedCredentialsIfExist() {
  //   try {
  //     const content = await fs.readFile(TOKEN_PATH);
  //     const string = content.toString();
  //     const credentials = JSON.parse(string);
  //     return google.auth.fromJSON(credentials);
  //   } catch (err) {
  //     // console.error('Помилка завантаження збережених облікових даних:', err);
  //     return null;
  //   }
  // }

  async saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  }

  async authorize() {
    // ???????????????????????????????????????????????????????????
    // let client: any = await this.loadSavedCredentialsIfExist();
    let client: any = '';

    if (client) {
      return client;
    }

    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });

    if (client.credentials) {
      await this.saveCredentials(client);
    }
    return client;
  }

  // async authorize(): Promise<any> {
  //   const content = await fs.readFile(CREDENTIALS_PATH);
  //   const apiKeys = JSON.parse(content);

  //   const auth = new google.auth.GoogleAuth({
  //     credentials: apiKeys,
  //     scopes: SCOPES,
  //   });
  //   return auth;

  //   // const calendar = google.calendar({ version: 'v3', auth });
  //   // return calendar;
  // }

  // calendar

  async getCalendar() {
    const res = await this.googleClient.calendarList.list();
    return res.data;

    // Старий варіант авторизації: (Після тестування нового цей видалити)
    // const auth = await this.authorize();
    // const calendar = google.calendar({ version: 'v3', auth });

    // const res = await calendar.calendarList.list();
    // return res.data;
  }

  // return new calendar id
  async createCalendar(dto: CreateGoogleCalendarDto): Promise<string> {
    const res = await this.googleClient.calendars.insert({
      requestBody: { summary: `Розклад ${dto.owner}`, timeZone: 'Europe/Kiev' },
    });

    if (!res.data.id) {
      throw new BadRequestException('Помилка при створенні календаря');
    }

    return res.data.id;
    // Старий варіант авторизації: (Після тестування нового цей видалити)
    // const auth = await this.authorize();
    // const calendar = google.calendar({ version: 'v3', auth });
    // const res = await calendar.calendars.insert({
    //   requestBody: { summary: `Розклад ${dto.owner}`, timeZone: 'Europe/Kiev' },
    // });
    // if (!res.data.id) {
    //   throw new BadRequestException('Помилка при створенні календаря');
    // }
    // return res.data.id;
  }

  async updateCalendar(dto: UpdateGoogleCalendarDto) {
    const res = await this.googleClient.calendars.patch({
      calendarId: dto.calendarId,
      requestBody: { summary: `Розклад ${dto.owner}` },
    });

    if (!res.data.id) {
      throw new BadRequestException('Помилка при оновленні календаря');
    }
    // Старий варіант авторизації: (Після тестування нового цей видалити)
    // const auth = await this.authorize();
    // const calendar = google.calendar({ version: 'v3', auth });

    // const res = await calendar.calendars.patch({
    //   calendarId: dto.calendarId,
    //   requestBody: { summary: `Розклад ${dto.owner}` },
    // });

    // if (!res.data.id) {
    //   throw new BadRequestException('Помилка при оновленні календаря');
    // }
  }

  async deleteCalendar(dto: DeleteGoogleCalendarDto) {
    const res = await this.googleClient.calendars.delete({ calendarId: dto.calendarId });
    return res.data;
    // Старий варіант авторизації: (Після тестування нового цей видалити)
    // const auth = await this.authorize();
    // const calendar = google.calendar({ version: 'v3', auth });

    // const res = await calendar.calendars.delete({ calendarId: dto.calendarId });
    // return res.data;
  }

  // calendar events
  async createCalendarEvent(dto: CreateGoogleCalendarEventDto) {
    // const auth = await this.authorize();
    // const calendar = google.calendar({ version: 'v3', auth });

    const res = await this.googleClient.events.insert({
      // auth: auth,
      calendarId: dto.calendarId,
      // calendarId: 'primary', // указывает на основной календарь этого пользователя
      conferenceDataVersion: 1,
      requestBody: {
        summary: dto.summary,
        description: dto.description,
        location: dto.location,
        start: { dateTime: dto.startTime, timeZone: 'Europe/Kyiv' },
        end: { dateTime: dto.endTime, timeZone: 'Europe/Kyiv' },
      },
    });

    return res.data;
    // Старий варіант авторизації: (Після тестування нового цей видалити)
    // const auth = await this.authorize();
    // const calendar = google.calendar({ version: 'v3', auth });

    // const response = await calendar.events.insert({
    //   auth: auth,
    //   calendarId: dto.calendarId,
    //   // calendarId: 'primary', // указывает на основной календарь этого пользователя
    //   conferenceDataVersion: 1,
    //   requestBody: {
    //     summary: dto.summary,
    //     description: dto.description,
    //     location: dto.location,
    //     start: { dateTime: dto.startTime, timeZone: 'Europe/Kyiv' },
    //     end: { dateTime: dto.endTime, timeZone: 'Europe/Kyiv' },
    //   },
    // });

    // return response.data;
  }

  // Оновити аудиторію
  async updateCalendarEvent(dto: UpdateGoogleCalendarEventDto) {
    const response = await this.googleClient.events.get({
      calendarId: dto.calendarId,
      eventId: '',
    });

    // @ts-ignore
    const existedEvent = response.data.items.filter((el) => {
      return el.summary === dto.summary && el.description === dto.description;
    });

    if (!existedEvent.length) return;

    await this.googleClient.events.update({
      calendarId: dto.calendarId, // Идентификатор календаря
      eventId: existedEvent[0].id, // Идентификатор события, которое нужно хотите обновить
      requestBody: {
        summary: existedEvent[0].summary,
        description: existedEvent[0].description,
        location: dto.location,
        start: {
          dateTime: existedEvent[0].start.dateTime,
          timeZone: 'Europe/Kiev',
        },
        end: {
          dateTime: existedEvent[0].end.dateTime,
          timeZone: 'Europe/Kiev',
        },
      },
    });
    // Старий варіант авторизації: (Після тестування нового цей видалити)
    /* const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.get({
      calendarId: dto.calendarId,
      eventId: '',
    });

    // @ts-ignore
    const existedEvent = response.data.items.filter((el) => {
      return el.summary === dto.summary && el.description === dto.description;
    });

    if (!existedEvent.length) return;

    await calendar.events.update({
      calendarId: dto.calendarId, // Идентификатор календаря
      eventId: existedEvent[0].id, // Идентификатор события, которое нужно хотите обновить
      requestBody: {
        summary: existedEvent[0].summary,
        description: existedEvent[0].description,
        location: dto.location,
        start: {
          dateTime: existedEvent[0].start.dateTime,
          timeZone: 'Europe/Kiev',
        },
        end: {
          dateTime: existedEvent[0].end.dateTime,
          timeZone: 'Europe/Kiev',
        },
      },
    }); */
  }

  async findCalendarEvent(calendarId: string, summary: string, description: string): Promise<string> {
    const res = await this.googleClient.events.list({ calendarId });

    if (!res.data.items) return;

    const eventsList = res.data.items;

    const event = eventsList.find((e) => e.summary === summary && e.description === description);
    if (!event) return;

    return event.id;
    // Старий варіант авторизації: (Після тестування нового цей видалити)
    /* const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const res = await calendar.events.list({ calendarId });

    if (!res.data.items) return;

    const eventsList = res.data.items;

    const event = eventsList.find((e) => e.summary === summary && e.description === description);
    if (!event) return;

    return event.id; */
  }

  async deleteCalendarEvent(calendarId: string, dto: FindCalendarEventDto) {
    const eventDto = await this.getCalendarEventDto(dto);

    const eventId = await this.findCalendarEvent(calendarId, eventDto.summary, eventDto.description);

    if (!calendarId || !eventId) return;

    const res = await this.googleClient.events.delete({ calendarId, eventId });
    return res.data;
    // Старий варіант авторизації: (Після тестування нового цей видалити)
    /* const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const eventDto = await this.getCalendarEventDto(dto);

    const eventId = await this.findCalendarEvent(calendarId, eventDto.summary, eventDto.description);

    if (!calendarId || !eventId) return;

    const res = await calendar.events.delete({ calendarId, eventId });
    return res.data; */
  }

  async getCalendarEventDto(dto: FindCalendarEventDto) {
    const settings = await this.settingsRepository.findOne({
      where: { id: 1 },
    });

    if (!settings) {
      throw new NotFoundException('Налаштування не знайдені');
    }

    let calendarId: string;

    if (dto.type === 'teacher') {
      const teacher = await this.teacherRepository.findOne({
        where: { id: dto.itemId },
      });

      if (!teacher) {
        throw new NotFoundException('Викладача не знайдені');
      }

      calendarId = teacher.calendarId;
    }

    if (dto.type === 'group') {
      const group = await this.groupRepository.findOne({
        where: { id: dto.itemId },
      });

      if (!group) {
        throw new NotFoundException('Групу не знайдено');
      }

      calendarId = group.calendarId;
    }

    if (!calendarId) {
      throw new NotFoundException('ID календаря не знайдено');
    }

    const lessonDate = customDayjs(dto.date);
    const formattedDateTime = lessonDate.format('ddd, D MMMM');

    const callSchedule = settings.callSchedule[dto.lessonNumber];

    const subgroup = dto.subgroupNumber ? ` ${dto.subgroupNumber} підгрупа` : '';

    const summary = `${dto.lessonName} - Група ${dto.groupName}${subgroup}`;
    const description = `${formattedDateTime} ⋅ ${callSchedule.start} - ${callSchedule.end}`;
    const location = dto.auditoryName;

    return {
      summary,
      description,
      location,
      calendarId,
      startTime: `${lessonDate.format('YYYY-MM-DD')}T${callSchedule.start}:00`,
      endTime: `${lessonDate.format('YYYY-MM-DD')}T${callSchedule.end}:00`,
    };
  }
}

/*
      SettingsEntity {
        id: 1,
        firstSemesterStart: '09.01.2023',
        firstSemesterEnd: '12.24.2023',
        secondSemesterStart: '02.01.2024',
        secondSemesterEnd: '06.30.2024',
        callSchedule: {
          '1': { start: '08:30', end: '09:50' },
          '2': { start: '10:00', end: '11:20' },
          '3': { start: '12:00', end: '13:20' },
          '4': { start: '13:30', end: '14:50' },
          '5': { start: '15:00', end: '16:20' },
          '6': { start: '16:30', end: '17:50' },
          '7': { start: '08:30', end: '09:50' }
        }
      }
*/

// const event = {
//   summary: 'Google I/O 2024',
//   location: '800 Howard St., San Francisco, CA 94103',
//   description: "A chance to hear more about Google's developer products.",
//   start: {
//     dateTime: '2024-02-25T09:00:00-07:00',
//     timeZone: 'America/Los_Angeles',
//   },
//   conferenceData: {
//     createWithGoogleMeet: true,
//   },
//   end: {
//     dateTime: '2024-02-25T17:00:00-08:00',
//     timeZone: 'America/Los_Angeles',
//   },
//   recurrence: ['RRULE:FREQ=DAILY;COUNT=2'],
//   attendees: [
//     { email: 'roma.250899@gmail.com' },
//     // { email: 'sbrin@example.com' },
//   ],
//   reminders: {
//     useDefault: false,
//     overrides: [
//       { method: 'email', minutes: 24 * 60 },
//       { method: 'popup', minutes: 10 },
//     ],
//   },
// };

// {
//   kind: 'admin#directory#user',
//   id: '111079848888783784505',
//   etag: '"g3-uukzdDYX7mcsQqDSmVT-0S6NlDP7HhGVb5s3jADM/VvkIwZiqJvf3bBHiaBaW8qs4M9g"',
//   primaryEmail: 'test.student@pharm.zt.ua',
//   name: {
//     givenName: 'Студент',
//     familyName: 'ЖБФФК',
//     fullName: 'Студент ЖБФФК'
//   },
//   isAdmin: false,
//   isDelegatedAdmin: false,
//   lastLoginTime: '2025-01-13T06:52:32.000Z',
//   creationTime: '2024-01-24T11:30:47.000Z',
//   agreedToTerms: true,
//   suspended: false,
//   archived: false,
//   changePasswordAtNextLogin: false,
//   ipWhitelisted: false,
//   emails: [
//     { address: 'test.student@pharm.zt.ua', primary: true },
//     { address: 'test.student@pharm.zt.ua.test-google-a.com' }
//   ],
//   languages: [ { languageCode: 'uk', preference: 'preferred' } ],
//   nonEditableAliases: [ 'test.student@pharm.zt.ua.test-google-a.com' ],
//   customerId: 'C03l794bc',
//   orgUnitPath: '/Студенти/Відраховані',
//   isMailboxSetup: true,
//   isEnrolledIn2Sv: false,
//   isEnforcedIn2Sv: false,
//   includeInGlobalAddressList: true
// }
