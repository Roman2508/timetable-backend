import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { InstructionalMaterialsService } from './instructional-materials.service';
import { CreateInstructionalMaterialDto } from './dto/create-instructional-material.dto';
import { UpdateInstructionalMaterialDto } from './dto/update-instructional-material.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('instructional-materials')
@Controller('instructional-materials')
export class InstructionalMaterialsController {
  constructor(private readonly instructionalMaterialsService: InstructionalMaterialsService) {}

  @Post()
  create(@Body() dto: CreateInstructionalMaterialDto) {
    return this.instructionalMaterialsService.create(dto);
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.instructionalMaterialsService.find(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInstructionalMaterialDto) {
    return this.instructionalMaterialsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instructionalMaterialsService.remove(+id);
  }
}
