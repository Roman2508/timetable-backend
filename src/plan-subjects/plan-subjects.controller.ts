import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PlanSubjectsService } from './plan-subjects.service';
import { CreatePlanSubjectDto } from './dto/create-plan-subject.dto';
import { UpdatePlanSubjectNameDto } from './dto/update-plan-subject-name.dto';
import { UpdatePlanSubjectHoursDto } from './dto/update-plan-subject-hours.dto';

@Controller('plan-subjects')
@ApiTags('plan-subjects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlanSubjectsController {
  constructor(private readonly planSubjectsService: PlanSubjectsService) {}

  @Get('/:id')
  @ApiQuery({ name: 'semesters', type: String, required: false })
  findAll(@Param('id') id: string, @Query('semesters') semesters?: string) {
    return this.planSubjectsService.findAll(+id, semesters);
  }

  @ApiBody({ type: CreatePlanSubjectDto })
  @Post()
  create(@Body() dto: CreatePlanSubjectDto) {
    return this.planSubjectsService.create(dto);
  }

  @ApiBody({ type: UpdatePlanSubjectNameDto })
  @Patch('name')
  updateName(@Body() dto: UpdatePlanSubjectNameDto) {
    return this.planSubjectsService.updateName(dto);
  }

  @ApiBody({ type: UpdatePlanSubjectHoursDto })
  @Patch('hours/:id')
  updateHours(@Param('id') id: string, @Body() dto: UpdatePlanSubjectHoursDto) {
    return this.planSubjectsService.updateHours(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.planSubjectsService.remove(+id);
    return id;
  }
}
