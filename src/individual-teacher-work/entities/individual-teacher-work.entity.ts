import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum IndividualTeacherWordTypes {
  METHODICAL_WORK = 'Методична робота',
  SCIENTIFIC_WORK = 'Наукова робота',
  ORGANIZATIONAL_WORK = 'Організаційна робота',
}

@Entity('individual-teacher-work')
export class IndividualTeacherWorkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: IndividualTeacherWordTypes,
    default: IndividualTeacherWordTypes.METHODICAL_WORK,
  })
  type: IndividualTeacherWordTypes;

  @Column()
  hours: number;

  @Column()
  date: string;

  @Column()
  description: string;
}
