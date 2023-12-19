import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupLoadLessonDto } from './dto/create-group-load-lesson.dto';
import { UpdateGroupLoadLessonDto } from './dto/update-group-load-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupLoadLessonEntity } from './entities/group-load-lesson.entity';
import { Repository } from 'typeorm';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';

@Injectable()
export class GroupLoadLessonsService {
  constructor(
    @InjectRepository(GroupLoadLessonEntity)
    private groupLoadLessonsRepository: Repository<GroupLoadLessonEntity>,

    @InjectRepository(PlanSubjectEntity)
    private planSubjectsRepository: Repository<PlanSubjectEntity>,
  ) {}

  async create(dto: CreateGroupLoadLessonDto) {
    try {
      const selectedPlanSubjects = await this.planSubjectsRepository.find({
        where: { plan: { id: dto.educationPlanId } },
      });

      if (!selectedPlanSubjects.length) {
        throw new NotFoundException('Навчальний план не знайдено');
      }

      const groupLoadLessons: GroupLoadLessonEntity[] = [];

      const subjectTypes = [
        { name: 'lectures', alias: { ru: 'ЛК', en: 'lectures' } },
        { name: 'practical', alias: { ru: 'ПЗ', en: 'practical' } },
        { name: 'laboratory', alias: { ru: 'ЛАБ', en: 'laboratory' } },
        { name: 'seminars', alias: { ru: 'СЕМ', en: 'seminars' } },
        { name: 'exams', alias: { ru: 'ЕКЗ', en: 'exams' } },
      ];

      selectedPlanSubjects.map(async (lesson) => {
        for (let key in lesson) {
          const findedSubjectType = subjectTypes.find(
            (type) => type.name === key,
          );

          // Якщо дисципліну знайдено (за типом) і кількість годин !== 0 - створюю group-load-lesson
          if (findedSubjectType && lesson[findedSubjectType?.name] !== 0) {
            const payload = {
              name: lesson.name,
              group: { id: dto.groupId },
              plan: { id: dto.educationPlanId },
              planSubjectId: { id: lesson.id },
              semester: lesson.semesterNumber,
              specialization: null,
              typeRu: findedSubjectType.alias.ru,
              typeEn: findedSubjectType.alias.en,
              hours: lesson[key],
              teacher: null,
              stream: null,
              subgroupNumber: null,
              students: dto.students,
            };

            const newLesson = this.groupLoadLessonsRepository.create(payload);

            groupLoadLessons.push(
              await this.groupLoadLessonsRepository.save(newLesson),
            );
          }
        }
      });

      return groupLoadLessons;
    } catch (err) {
      console.log(err.message);
      throw new BadRequestException('Помилка при створенні навантаження групи');
    }
  }

  findAll() {
    return `This action returns all groupLoadLessons`;
  }

  findOne(id: number) {
    return `This action returns a #${id} groupLoadLesson`;
  }

  update(id: number, dto: UpdateGroupLoadLessonDto) {
    // planSubjectId, newName

    return `This action updates a #${id} groupLoadLesson`;
  }
}
