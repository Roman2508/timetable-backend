import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuditoryCategoryDto } from './dto/create-auditory-category.dto';
import { UpdateAuditoryCategoryDto } from './dto/update-auditory-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditoryCategoryEntity } from './entities/auditory-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuditoryCategoriesService {
  constructor(
    @InjectRepository(AuditoryCategoryEntity)
    private repository: Repository<AuditoryCategoryEntity>,
  ) {}

  findAll() {
    return this.repository.find({
      relations: { auditories: { category: true } },
      select: {
        id: true,
        name: true,
        auditories: {
          id: true,
          name: true,
          seatsNumber: true,
          category: { id: true, name: true },
        },
      },
    });
  }

  create(dto: CreateAuditoryCategoryDto) {
    const newCategory = this.repository.create({
      name: dto.name,
      auditories: [],
    });

    return this.repository.save(newCategory);
  }

  async update(id: number, dto: UpdateAuditoryCategoryDto) {
    const category = await this.repository.findOne({
      where: { id },
      relations: { auditories: true },
    });

    if (!category) {
      throw new NotFoundException('Не знайдено');
    }

    return this.repository.save({ ...category, name: dto.name });
  }

  async remove(id: number) {
    const category = await this.repository.findOne({
      where: { id },
      relations: { auditories: true },
    });

    if (!category) {
      throw new NotFoundException('Не знайдено');
    }

    if (category.auditories.length > 0) {
      throw new BadRequestException(
        'Не можна видалити категорію в якій є аудиторії',
      );
    }

    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
