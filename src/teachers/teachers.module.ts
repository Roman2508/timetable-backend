import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherEntity } from './entities/teacher.entity';

@Module({
  controllers: [TeachersController],
  providers: [TeachersService],
  imports: [TypeOrmModule.forFeature([TeacherEntity])],
})
export class TeachersModule {}
