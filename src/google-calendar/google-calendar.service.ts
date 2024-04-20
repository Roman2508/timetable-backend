const path = require('path');
const fs = require('fs').promises;

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as dayjs from 'dayjs';
import { google } from 'googleapis';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { customDayjs } from 'src/utils/customDayjs';
import { authenticate } from '@google-cloud/local-auth';

import { TeacherEntity } from 'src/teachers/entities/teacher.entity';
import { SettingsEntity } from 'src/settings/entities/setting.entity';
import { CreateGoogleCalendarDto } from './dto/create-google-calendar.dto';
import { UpdateGoogleCalendarDto } from './dto/update-google-calendar.dto';
import { DeleteGoogleCalendarDto } from './dto/delete-google-calendar.dto';
import { UpdateGoogleCalendarEventDto } from './dto/update-google-calendar-event.dto';
import { CreateGoogleCalendarEventDto } from './dto/create-google-calendar-event.dto';
import { GroupEntity } from 'src/groups/entities/group.entity';

const TOKEN_PATH = path.join(process.cwd(), 'src/google-calendar/token.json');
const CREDENTIALS_PATH = path.join(
  process.cwd(),
  'src/google-calendar/client_secret.json',
);
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/meetings',
  'https://www.googleapis.com/auth/meetings.space.created',
];

@Injectable()
export class GoogleCalendarService {
  constructor(
    @InjectRepository(SettingsEntity)
    private settingsRepository: Repository<SettingsEntity>,

    @InjectRepository(TeacherEntity)
    private teacherRepository: Repository<TeacherEntity>,

    @InjectRepository(GroupEntity)
    private groupRepository: Repository<GroupEntity>,
  ) {}

  // auth

  async loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const string = content.toString();
      const credentials = JSON.parse(string);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      // console.error('Помилка завантаження збережених облікових даних:', err);
      return null;
    }
  }

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
    let client: any = await this.loadSavedCredentialsIfExist();

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

  // calendar

  // return new calendar id
  async createCalendar(dto: CreateGoogleCalendarDto): Promise<string> {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const res = await calendar.calendars.insert({
      requestBody: { summary: `Розклад ${dto.owner}`, timeZone: 'Europe/Kiev' },
    });

    if (!res.data.id) {
      throw new BadRequestException('Помилка при створенні календаря');
    }

    return res.data.id;
  }

  async updateCalendar(dto: UpdateGoogleCalendarDto) {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const res = await calendar.calendars.patch({
      calendarId: dto.calendarId,
      requestBody: { summary: `Розклад ${dto.owner}` },
    });

    if (!res.data.id) {
      throw new BadRequestException('Помилка при оновленні календаря');
    }
  }

  async deleteCalendar(dto: DeleteGoogleCalendarDto) {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const res = await calendar.calendars.delete({ calendarId: dto.calendarId });
    return res.data;
  }

  // calendar events

  async createCalendarEvent(dto: CreateGoogleCalendarEventDto) {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    // await calendar.calendarList.list();

    const response = await calendar.events.insert({
      auth: auth,
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

    return response.data;
  }

  async updateCalendarEvent(dto: UpdateGoogleCalendarEventDto) {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.get({
      calendarId: dto.calendarId,
      eventId: '',
    });

    if (!response.data) {
      throw new BadRequestException('Event not found');
    }

    // @ts-ignore
    const existedEvent = response.data.items[0];

    if (!existedEvent) {
      throw new BadRequestException('Event not found');
    }

    await calendar.events.update({
      calendarId: dto.calendarId, // Идентификатор календаря
      eventId: existedEvent.id, // Идентификатор события, которое нужно хотите обновить
      requestBody: {
        summary: dto.summary,
        description: dto.description, //event.description
        location: dto.location, //event.location
        start: {
          dateTime: existedEvent.start.dateTime,
          timeZone: 'Europe/Kiev',
        },
        end: {
          dateTime: existedEvent.end.dateTime,
          timeZone: 'Europe/Kiev',
        },
      },
    });
  }

  async getCalendarEventDto(
    lessonName: string,
    lessonNumber: number,
    date: Date,
    groupName: string,
    subgroupNumber: number | null,
    auditoryName: string,
    itemId: number,
    type: 'teacher' | 'group',
  ) {
    const settings = await this.settingsRepository.findOne({
      where: { id: 1 },
    });

    if (!settings) {
      throw new NotFoundException('Налаштування не знайдені');
    }

    let calendarId: string;

    if (type === 'teacher') {
      const teacher = await this.teacherRepository.findOne({
        where: { id: itemId },
      });

      if (!teacher) {
        throw new NotFoundException('Викладача не знайдені');
      }

      calendarId = teacher.calendarId;
    }

    if (type === 'group') {
      const group = await this.groupRepository.findOne({
        where: { id: itemId },
      });

      if (!group) {
        throw new NotFoundException('Групу не знайдені');
      }

      calendarId = group.calendarId;
    }

    if (!calendarId) {
      throw new NotFoundException('ID календаря не знайдено');
    }

    const lessonDate = customDayjs(date);
    const formattedDateTime = lessonDate.format('ddd, D MMMM');

    const callSchedule = settings.callSchedule[lessonNumber];

    const subgroup = subgroupNumber ? ` ${subgroupNumber} підгрупа` : '';

    const summary = `${lessonName} - Група ${groupName}${subgroup}`;
    const description = `${formattedDateTime} ⋅ ${callSchedule.start} - ${callSchedule.end}`;
    const location = auditoryName;

    return {
      summary,
      description,
      location,
      calendarId,
      startTime: `${lessonDate.format('YYYY-MM-DD')}T${callSchedule.start}:00`,
      endTime: `${lessonDate.format('YYYY-MM-DD')}T${callSchedule.end}:00`,
    };
  }

  async getCalendar() {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const res = await calendar.calendarList.list();
    return res.data;
  }
}

/*
      SettingsEntity {
        id: 1,
        firstSemesterStart: '09.01.2023',
        firstSemesterEnd: '12.24.2023',
        secondSemesterStart: '02.01.2024',
        secondSemesterEnd: '06.30.2024',
        callSchedule: Lesson {
          '1': LessonCall { start: '08:30', end: '09:50' },
          '2': LessonCall { start: '10:00', end: '11:20' },
          '3': LessonCall { start: '12:00', end: '13:20' },
          '4': LessonCall { start: '13:30', end: '14:50' },
          '5': LessonCall { start: '15:00', end: '16:20' },
          '6': LessonCall { start: '16:30', end: '17:50' },
          '7': LessonCall { start: '08:30', end: '09:50' }
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
