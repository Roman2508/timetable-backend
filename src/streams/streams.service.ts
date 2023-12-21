import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStreamDto } from './dto/create-stream.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StreamEntity } from './entities/stream.entity';
import { Repository } from 'typeorm';
import { UpdateStreamNameDto } from './dto/update-stream-name.dto';
import { AddGroupToStreamDto } from './dto/add-group-to-stream.dto';

@Injectable()
export class StreamsService {
  constructor(
    @InjectRepository(StreamEntity)
    private repository: Repository<StreamEntity>,
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
    return this.repository.find();
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

    this.repository.save({ ...stream, groups: newStreamGroups });

    return { streamId, groupId };
  }

  async removeStream(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Потік не знайдено');
    }

    return id;
  }
}
