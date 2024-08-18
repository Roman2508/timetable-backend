import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StudentsService } from './students.service';
import { StudentEntity } from './entities/student.entity';
import { StudentsController } from './students.controller';
import { GroupEntity } from 'src/groups/entities/group.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  imports: [TypeOrmModule.forFeature([StudentEntity, GroupEntity]), UsersModule],
})
export class StudentsModule {}
