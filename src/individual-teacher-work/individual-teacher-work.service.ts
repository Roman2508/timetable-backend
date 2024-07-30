import { Injectable } from '@nestjs/common';
import { CreateIndividualTeacherWorkDto } from './dto/create-individual-teacher-work.dto';
import { UpdateIndividualTeacherWorkDto } from './dto/update-individual-teacher-work.dto';

@Injectable()
export class IndividualTeacherWorkService {
  create(createIndividualTeacherWorkDto: CreateIndividualTeacherWorkDto) {
    return 'This action adds a new individualTeacherWork';
  }

  findAll() {
    return `This action returns all individualTeacherWork`;
  }

  findOne(id: number) {
    return `This action returns a #${id} individualTeacherWork`;
  }

  update(id: number, updateIndividualTeacherWorkDto: UpdateIndividualTeacherWorkDto) {
    return `This action updates a #${id} individualTeacherWork`;
  }

  remove(id: number) {
    return `This action removes a #${id} individualTeacherWork`;
  }
}
