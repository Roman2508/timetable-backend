import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PlanSubjectsService } from './plan-subjects.service';
import { CreatePlanSubjectDto } from './dto/create-plan-subject.dto';
import { UpdatePlanSubjectHoursDto } from './dto/update-plan-subject-hours.dto';
import { UpdatePlanSubjectNameDto } from './dto/update-plan-subject-name.dto';

@Controller('plan-subjects')
@ApiTags('plan-subjects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlanSubjectsController {
  constructor(private readonly planSubjectsService: PlanSubjectsService) {}

  @ApiBody({ type: CreatePlanSubjectDto })
  @Post()
  create(@Body() dto: CreatePlanSubjectDto) {
    return this.planSubjectsService.create(dto);
  }

  @ApiBody({ type: UpdatePlanSubjectNameDto })
  @Patch('name/:id')
  updateName(@Param('id') id: string, @Body() dto: UpdatePlanSubjectNameDto) {
    return this.planSubjectsService.updateName(+id, dto);
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
