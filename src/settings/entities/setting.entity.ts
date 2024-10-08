import { Column, Entity, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';

export class LessonCall {
  @Column({ default: '08:30' })
  start: string;

  @Column({ default: '09:50' })
  end: string;
}

export class Lesson {
  @Column((type) => LessonCall)
  @JoinColumn({ name: '1' })
  ['1']: LessonCall;

  @Column((type) => LessonCall)
  @JoinColumn({ name: '2' })
  ['2']: LessonCall;

  @Column((type) => LessonCall)
  @JoinColumn({ name: '3' })
  ['3']: LessonCall;

  @Column((type) => LessonCall)
  @JoinColumn({ name: '4' })
  ['4']: LessonCall;

  @Column((type) => LessonCall)
  @JoinColumn({ name: '5' })
  ['5']: LessonCall;

  @Column((type) => LessonCall)
  @JoinColumn({ name: '6' })
  ['6']: LessonCall;

  @Column((type) => LessonCall)
  @JoinColumn({ name: '7' })
  ['7']: LessonCall;
}

export class Colors {
  @Column({ default: '#ffffff' })
  lectures: string;

  @Column({ default: '#ffffff' })
  practical: string;

  @Column({ default: '#ffffff' })
  laboratory: string;

  @Column({ default: '#ffffff' })
  seminars: string;

  @Column({ default: '#ffffff' })
  exams: string;

  @Column({ default: '#ffffff' })
  examsConsulation: string;
}

@Entity('settings')
export class SettingsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstSemesterStart: string;

  @Column()
  firstSemesterEnd: string;

  @Column()
  secondSemesterStart: string;

  @Column()
  secondSemesterEnd: string;

  @Column((type) => Lesson, { array: true })
  @JoinColumn({ name: 'callSchedule' })
  callSchedule: Lesson;

  @Column((type) => Colors, { array: true })
  @JoinColumn({ name: 'colors' })
  colors: Colors;
}
