import { AuditoryEntity } from 'src/auditories/entities/auditory.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auditory-categories')
export class AuditoryCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  shortName: string;

  @OneToMany(() => AuditoryEntity, (auditory) => auditory.category)
  auditories: AuditoryEntity[];
}
