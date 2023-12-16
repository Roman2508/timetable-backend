import { GroupEntity } from 'src/groups/entities/group.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('group-categories')
export class GroupCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => GroupEntity, (groups) => groups.category)
  groups: GroupEntity[];
}
