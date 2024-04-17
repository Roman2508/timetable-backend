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
import { authenticate } from '@google-cloud/local-auth';

import { StreamEntity } from 'src/streams/entities/stream.entity';
import { SettingsEntity } from 'src/settings/entities/setting.entity';
import { ScheduleLessonsEntity } from './entities/schedule-lesson.entity';
import { CreateScheduleLessonDto } from './dto/create-schedule-lesson.dto';
import { UpdateScheduleLessonDto } from './dto/update-schedule-lesson.dto';

const TOKEN_PATH = path.join(process.cwd(), 'src/schedule-lessons/token.json');
const CREDENTIALS_PATH = path.join(
  process.cwd(),
  'src/schedule-lessons/client_secret.json',
);
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/meetings',
  'https://www.googleapis.com/auth/meetings.space.created',
];

@Injectable()
export class ScheduleLessonsService {
  constructor(
    @InjectRepository(ScheduleLessonsEntity)
    private repository: Repository<ScheduleLessonsEntity>,

    @InjectRepository(StreamEntity)
    private streamRepository: Repository<StreamEntity>,

    @InjectRepository(SettingsEntity)
    private settingsRepository: Repository<SettingsEntity>,
  ) {}

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

  async createCalendarEvent() {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

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

    // await calendar.calendarList.list();

    const response = await calendar.events.get({
      calendarId: 'test.student@pharm.zt.ua',
      eventId: '',
    });

    // @ts-ignore
    const event = response.data.items[0];
    // @ts-ignore
    const eventId = response.data?.items[0]?.id;

    console.log('event: ', event);

    const a = await calendar.events.update({
      calendarId: 'test.student@pharm.zt.ua', // Идентификатор календаря
      eventId: eventId, // Идентификатор события, которое вы хотите обновить
      requestBody: {
        summary: 'Інформатика - Група 203 2 підгрупа',
        description: 'Середа, 17 квітня ⋅ 10:00 – 11:20дп', //event.description
        location: '217', //event.location
        start: {
          dateTime: event.start.dateTime,
          timeZone: 'Europe/Kiev',
        },
        end: {
          dateTime: event.end.dateTime,
          timeZone: 'Europe/Kiev',
        },
      },
    });

    // console.log(a);

    // CREATE

    // const responce = await calendar.events.insert({
    //   auth: auth,
    //   calendarId: 'test.student@pharm.zt.ua',
    //   // calendarId: 'primary', // указывает на основной календарь этого пользователя
    //   conferenceDataVersion: 1,
    //   requestBody: {
    //     summary: 'Інформатика - Група 203 2 підгрупа',
    //     description: 'Вівторок, 16 квітня⋅10:00 – 11:20',
    //     location: '217',
    //     start: { dateTime: '2024-04-17T10:00:00', timeZone: 'Europe/Kyiv' },
    //     end: { dateTime: '2024-04-17T11:20:00', timeZone: 'Europe/Kyiv' },
    //     conferenceData: {},
    //   },
    // });

    return response.data;
  }

  async findOneByDateAndGroup(
    date: Date,
    lessonNumber: number,
    semester: number,
    groupId: number,
    typeRu: 'ЛК' | 'ПЗ' | 'ЛАБ' | 'СЕМ' | 'ЕКЗ',
  ) {
    return this.repository.findOne({
      where: { date, lessonNumber, semester, typeRu, group: { id: groupId } },
      relations: {
        group: true,
        teacher: true,
        stream: { groups: true },
        auditory: true,
      },
      select: {
        group: { id: true, name: true },
        teacher: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
        },
        auditory: { id: true, name: true },
        stream: { id: true, name: true, groups: { id: true, name: true } },
      },
    });
  }

  async create(dto: CreateScheduleLessonDto) {
    // Спочатку треба перевірити чи в цей час та дату для цієї групи немає виставлених занять
    const lessonsOverlay = await this.repository.findOne({
      where: {
        date: dto.date,
        lessonNumber: dto.lessonNumber,
        semester: dto.semester,
        // group: { id: dto.group },
        teacher: { id: dto.teacher },
        // auditory: { id: dto.auditory },
      },
    });

    if (lessonsOverlay) {
      throw new BadRequestException('Можливі накладки занять');
    }

    // Перевіряю чи правильно передані дані
    // Має бути id аудиторії і isRemote: false АБО isRemote: true без id аудиторії
    if (!dto.auditory && !dto.isRemote) {
      throw new BadRequestException('Аудиторію не вибрано');
    }
    if (dto.auditory && dto.isRemote) {
      throw new BadRequestException(
        'Урок який буде проводитись дистанційно не повинен займати аудиторію',
      );
    }

    // Перевірити чи є потоки, якщо є - виставити для всіх груп в потоці
    if (dto.stream) {
      const stream = await this.streamRepository.findOne({
        where: { id: dto.stream },
        relations: { groups: true },
        select: { groups: { id: true } },
      });

      if (!stream) {
        throw new NotFoundException(
          'Помилка при створенні елемента розкладу для потоку',
        );
      }

      await Promise.all(
        stream.groups.map(async (el) => {
          const { group, teacher, auditory, stream, ...rest } = dto;

          const payload = {
            ...rest,
            group: { id: el.id },
            teacher: { id: teacher },
            stream: { id: stream },
          };

          if (auditory) {
            // Якщо урок буде проводитись не дистанційно
            const newLesson = this.repository.create({
              ...payload,
              auditory: { id: auditory },
            });

            return this.repository.save(newLesson);
          } else {
            // Якщо урок буде проводитись дистанційно
            const newLesson = this.repository.create(payload);

            return this.repository.save(newLesson);
          }
        }),
      );

      return this.findOneByDateAndGroup(
        dto.date,
        dto.lessonNumber,
        dto.semester,
        dto.group,
        dto.typeRu,
      );
    }

    const { group, teacher, auditory, stream, ...rest } = dto;

    const payload = this.repository.create({
      ...rest,
      group: { id: group },
      teacher: { id: teacher },
      stream: { id: stream },
    });

    if (auditory) {
      // Якщо урок буде проводитись не дистанційно
      const newLesson = this.repository.create({
        ...payload,
        auditory: { id: auditory },
      });

      await this.repository.save(newLesson);
    } else {
      // Якщо урок буде проводитись дистанційно
      const newLesson = this.repository.create(payload);

      await this.repository.save(newLesson);
    }

    return this.findOneByDateAndGroup(
      dto.date,
      dto.lessonNumber,
      dto.semester,
      dto.group,
      dto.typeRu,
    );
  }

  async findByTypeIdAndSemester(
    type: string,
    id: number,
    semesterStart?: string,
    semesterEnd?: string,
  ) {
    const start = semesterStart && dayjs(semesterStart, 'MM.DD.YYYY').toDate();
    const end = semesterEnd && dayjs(semesterEnd, 'MM.DD.YYYY').toDate();
    const date = start && end ? Between(start, end) : undefined;

    return this.repository.find({
      where: {
        [type]: { id },
        // semester: semester ? semester : undefined,
        date,
      },
      relations: {
        group: true,
        teacher: true,
        stream: { groups: true },
        auditory: true,
      },
      select: {
        group: { id: true, name: true },
        teacher: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
        },
        auditory: { id: true, name: true },
        stream: { id: true, name: true, groups: { id: true, name: true } },
      },
    });
  }

  async findAll(semester: number, type: string, id: number) {
    // dto: {type: 'group' | 'teacher' | 'auditory', id: ід групи, викладача або аудиторії, semester: номер семестру }

    const settings = await this.settingsRepository.findOne({
      where: { id: 1 },
    });
    if (!settings) throw new NotFoundException('Налаштування не знайдено');

    if (type === 'group' || type === 'teacher' || type === 'auditory') {
      // semester = 1 | 2
      const {
        firstSemesterStart,
        secondSemesterStart,
        firstSemesterEnd,
        secondSemesterEnd,
      } = settings;

      const semesterStart =
        semester === 1 ? firstSemesterStart : secondSemesterStart;
      const semesterEnd = semester === 1 ? firstSemesterEnd : secondSemesterEnd;

      const data = await this.findByTypeIdAndSemester(
        type,
        id,
        semesterStart,
        semesterEnd,
      );

      return data;
    }
  }

  // Оновити аудиторію для виставленого елемента розкладу
  async update(id: number, dto: UpdateScheduleLessonDto) {
    const lesson = await this.repository.findOne({
      where: { id },
      relations: {
        auditory: true,
        stream: { groups: true },
      },
      select: {
        auditory: { id: true, name: true },
        stream: { id: true, name: true, groups: { id: true, name: true } },
      },
    });

    // Якщо група об`єднана в потік потрібно оновити аудиторію для всіх груп потоку

    if (!lesson) throw new NotFoundException('Не знайдено');

    // Перевіряю чи правильно передані дані
    // Має бути id аудиторії і isRemote: false АБО isRemote: true без id аудиторії
    if (!dto.auditoryId && !dto.isRemote) {
      throw new BadRequestException('Аудиторію не вибрано');
    }
    if (dto.auditoryId && dto.isRemote) {
      throw new BadRequestException(
        'Урок який буде проводитись дистанційно не повинен займати аудиторію',
      );
    }

    // Якщо група об'єднана в потік і кількість груп в потоці більше 1
    if (lesson.stream && lesson.stream.groups.length > 1) {
      const currentsLessonDate = {
        date: lesson.date,
        lessonNumber: lesson.lessonNumber,
      };

      const streamLessonsInCurrentDate = await this.repository.find({
        where: {
          name: lesson.name,
          semester: lesson.semester,
          date: currentsLessonDate.date,
          stream: { id: lesson.stream.id },
          lessonNumber: currentsLessonDate.lessonNumber,
        },
        relations: {
          auditory: { category: true },
        },
        select: {
          auditory: {
            id: true,
            name: true,
            seatsNumber: true,
            category: { id: true, name: true },
          },
        },
      });

      // Якщо передано id аудиторії і isRemote = false - становлюю аудиторію для всіх груп в потоці
      if (dto.auditoryId && !dto.isRemote) {
        Promise.all(
          streamLessonsInCurrentDate.map(async (el) => {
            return this.repository.save({
              ...el,
              isRemote: false,
              auditory: { id: dto.auditoryId },
            });
          }),
        );
        //
      } else {
        Promise.all(
          streamLessonsInCurrentDate.map(async (el) => {
            return this.repository.save({
              ...el,
              isRemote: true,
              auditory: null,
            });
          }),
        );
      }

      if (dto.auditoryId) {
        return {
          id,
          isRemote: dto.isRemote,
          auditory: {
            id: dto.auditoryId,
            name: dto.auditoryName,
            seatsNumber: dto.seatsNumber,
          },
        };
        //
      } else {
        return {
          id,
          auditory: null,
          isRemote: dto.isRemote,
        };
      }
    }

    // Якщо група не об'єднана в потік
    const { auditory, isRemote, stream, ...rest } = lesson;

    if (dto.auditoryId) {
      return this.repository.save({
        ...rest,
        isRemote: dto.isRemote,
        auditory: {
          id: dto.auditoryId,
          name: dto.auditoryName,
          seatsNumber: dto.seatsNumber,
        },
      });
      //
    } else {
      return this.repository.save({
        ...rest,
        isRemote: dto.isRemote,
        auditory: null,
      });
    }
  }

  async getAuditoryOverlay(
    _date: string,
    lessonNumber: number,
    auditoryId: number,
  ) {
    if (!dayjs(_date).isValid()) {
      throw new BadRequestException('Не вірний формат дати');
    }

    const date = dayjs(_date, 'YYYY.MM.DD').format('YYYY-MM-DD 00:00:00');

    const lessons = await this.repository.find({
      // @ts-ignore
      where: { date, lessonNumber },
      relations: { auditory: true },
      select: { auditory: { id: true, name: true } },
    });

    const auditories = lessons.map((el) => el.auditory);

    return auditories.filter((el) => {
      // !el === дистанційно
      if (!el) return true;
      return el.id !== auditoryId;
    });
  }

  async remove(id: number) {
    const lesson = await this.repository.findOne({
      where: { id },
      relations: {
        auditory: true,
        stream: { groups: true },
      },
      select: {
        auditory: { id: true },
        stream: { id: true, name: true, groups: { id: true, name: true } },
      },
    });

    if (!lesson) throw new NotFoundException('Не знайдено');

    // Якщо група об'єднана в потік і кількість груп в потоці більше 1
    if (lesson.stream && lesson.stream.groups.length > 1) {
      const currentsLessonDate = {
        date: lesson.date,
        lessonNumber: lesson.lessonNumber,
      };

      const streamLessonsInCurrentDate = await this.repository.find({
        where: {
          name: lesson.name,
          semester: lesson.semester,
          date: currentsLessonDate.date,
          stream: { id: lesson.stream.id },
          lessonNumber: currentsLessonDate.lessonNumber,
        },
      });

      // Потрібно перевіряти чи були видалені елементи, якщо ні - повернути помилку !!!!!

      Promise.all(
        streamLessonsInCurrentDate.map(async (el) => {
          const res = await this.repository.delete({ id: el.id });

          if (res.affected === 0) {
            throw new NotFoundException('Не знайдено');
          }
        }),
      );

      return id;
    }

    // Якщо дисипліна не об'єднана в потік
    const res = await this.repository.delete({ id });

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
