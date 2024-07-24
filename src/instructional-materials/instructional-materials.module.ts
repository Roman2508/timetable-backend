import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InstructionalMaterialsService } from './instructional-materials.service';
import { InstructionalMaterialEnity } from './entities/instructional-material.entity';
import { InstructionalMaterialsController } from './instructional-materials.controller';

@Module({
  controllers: [InstructionalMaterialsController],
  providers: [InstructionalMaterialsService],
  imports: [TypeOrmModule.forFeature([InstructionalMaterialEnity])],
})
export class InstructionalMaterialsModule {}
