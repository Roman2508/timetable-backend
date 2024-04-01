import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  access: 'admin' | 'user'; // = EmployeeStatus

  @Column()
  email: string;
}

// enum EmployeeStatus {
//   Active = 'active',
//   Inactive = 'inactive',
//   Terminated = 'terminated',
// }

// @Entity()
// export class Employee {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({
//     type: 'enum',
//     enum: EmployeeStatus,
//     default: EmployeeStatus.Active,
//   })
//   status: EmployeeStatus;
// }
