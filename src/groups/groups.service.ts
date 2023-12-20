import { GroupLoadLessonsService } from './../group-load-lessons/group-load-lessons.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupEntity } from './entities/group.entity';
import { Repository } from 'typeorm';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupEntity)
    private groupsRepository: Repository<GroupEntity>,

    // @InjectRepository(PlanSubjectEntity)
    // private planSubjectsRepository: Repository<PlanSubjectEntity>,

    private groupLoadLessonsService: GroupLoadLessonsService,
  ) {}

  // findAll() {
  //   return `This action returns all groups`;
  // }

  async findOne(id: number) {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!group) throw new NotFoundException('Групу не знайдено');
    return group;
  }

  async findOneWithLoad(id: number) {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: { category: true, groupLoad: true },
    });

    if (!group) throw new NotFoundException('Групу не знайдено');
    return group;
  }

  async create(dto: CreateGroupDto) {
    const { category, educationPlan, ...rest } = dto;

    const newGroup = this.groupsRepository.create({
      ...rest,
      educationPlan: { id: educationPlan },
      category: { id: category },
      // groupLoad: [],
    });

    const group = await this.groupsRepository.save(newGroup);

    // Коли створюється нова група і до неї вперше прикріплюється навч.план - створюю для всіх дисциплін плану group-load-lessons
    await this.groupLoadLessonsService.createAll({
      groupId: newGroup.id,
      educationPlanId: educationPlan,
      students: newGroup.students,
    });

    return group;
  }

  update(id: number, dto: UpdateGroupDto) {
    return `This action updates a #${id} group`;
  }

  async remove(id: number) {
    const res = await this.groupsRepository.delete(id);

    // Коли видаляється група потрібно видаляти всі group-load-lessons які були в цієї групи !!!!!!!!!!!!!!!

    if (res.affected === 0) {
      throw new NotFoundException('Групу не знайдено');
    }

    return id;
  }
}

// const selectedPlanSubjects = await this.planSubjectsRepository.find({
//   where: { plan: { id: dto.educationPlan } },
// });

// const groupLoadLessons = [];

// selectedPlanSubjects.forEach((el) => {
//   const subjectTypes = [
//     { name: 'lectures', alias: { ru: 'ЛК', en: 'lectures' } },
//     { name: 'practical', alias: { ru: 'ПЗ', en: 'practical' } },
//     { name: 'laboratory', alias: { ru: 'ЛАБ', en: 'laboratory' } },
//     { name: 'seminars', alias: { ru: 'СЕМ', en: 'seminars' } },
//     { name: 'exams', alias: { ru: 'ЕКЗ', en: 'exams' } },
//     { name: 'lectures', alias: { ru: '', en: '' } },
//   ];

//   for (let key in el) {
//     const findedSubjectType = subjectTypes.find((el) => el.name === key);

//     if (findedSubjectType) {
//       //
//       const newLesson = {
//         name: el.name,
//         group: newGroup.id,
//         semester: el.semesterNumber,
//         specialization: null,
//         typeRu: findedSubjectType.alias.ru,
//         typeEn: findedSubjectType.alias.en,
//         hours: el[key],
//         teacher: null,
//         stream: null,
//         subgroupNumber: null,
//         students: null,
//       };
//       //
//       groupLoadLessons.push(newLesson);
//     }
//   }
// });
