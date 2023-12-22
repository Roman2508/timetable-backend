import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStreamDto } from './dto/create-stream.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StreamEntity } from './entities/stream.entity';
import { Repository } from 'typeorm';
import { UpdateStreamNameDto } from './dto/update-stream-name.dto';
import { AddGroupToStreamDto } from './dto/add-group-to-stream.dto';
import { GroupLoadLessonEntity } from 'src/group-load-lessons/entities/group-load-lesson.entity';

@Injectable()
export class StreamsService {
  constructor(
    @InjectRepository(StreamEntity)
    private repository: Repository<StreamEntity>,

    @InjectRepository(GroupLoadLessonEntity)
    private groupLoadLessonsRepository: Repository<GroupLoadLessonEntity>,
  ) {}

  create(dto: CreateStreamDto) {
    const newStream = this.repository.create({
      name: dto.name,
      groups: [],
      lessons: [],
    });
    return this.repository.save(newStream);
  }

  findAll() {
    return this.repository.find({
      relations: { groups: true, lessons: true },
      select: {
        groups: { id: true, name: true },
        lessons: {
          id: true,
          name: true,
          hours: true,
          semester: true,
          typeEn: true,
          typeRu: true,
          subgroupNumber: true,
          specialization: true,
          planSubjectId: { id: true },
        },
      },
    });
  }

  findOne(id: number) {
    const stream = this.repository.findOne({ where: { id } });
    if (!stream) throw new NotFoundException('Потік не знайдено');
    return stream;
  }

  async updateStreamName(id: number, dto: UpdateStreamNameDto) {
    const stream = await this.repository.findOne({ where: { id } });
    if (!stream) throw new NotFoundException('Потік не знайдено');

    return this.repository.save({ ...stream, name: dto.name });
  }

  async addGroupToStream(id: number, dto: AddGroupToStreamDto) {
    const stream = await this.repository.findOne({
      where: { id },
      relations: { groups: true },
      select: { groups: { id: true, name: true } },
    });
    if (!stream) throw new NotFoundException('Потік не знайдено');

    return this.repository.save({
      ...stream,
      groups: [...stream.groups, { id: dto.groupId }],
    });
  }

  async removeGroupFromStream(streamId: number, groupId: number) {
    const stream = await this.repository.findOne({
      where: { id: streamId },
      relations: { groups: true },
      select: { groups: { id: true } },
    });
    if (!stream) throw new NotFoundException('Потік не знайдено');

    const newStreamGroups = stream.groups.filter((el) => el.id !== groupId);

    await this.repository.save({ ...stream, groups: newStreamGroups });

    const groupLessons = await this.groupLoadLessonsRepository.find({
      where: { group: { id: groupId }, stream: { id: streamId } },
    });

    // Якщо видаляється з потоку групи - чи потрібно роз'єднувати всі дисципліни цього потоку?????
    // Якщо видаляється з потоку групи - чи потрібно роз'єднувати всі дисципліни цього потоку?????
    // Якщо видаляється з потоку групи - чи потрібно роз'єднувати всі дисципліни цього потоку?????
    const updatedLessons = await Promise.all(
      groupLessons.map(async (lesson) => {
        await this.groupLoadLessonsRepository.save({ ...lesson, stream: null });
      }),
    );

    // При видаленні групи з потоку потрібно виключити з потоку всі дисципліни цієї групи !!!
    // При видаленні групи з потоку потрібно виключити з потоку всі дисципліни цієї групи !!!
    // При видаленні групи з потоку потрібно виключити з потоку всі дисципліни цієї групи !!!

    return { streamId, groupId, updatedLessons };
  }

  async removeStream(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Потік не знайдено');
    }

    return id;
  }
}
