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
import { PlanSubjectsService } from './plan-subjects.service';
import { CreatePlanSubjectDto } from './dto/create-plan-subject.dto';
import { UpdatePlanSubjectDto } from './dto/update-plan-subject.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('plan-subjects')
@ApiTags('plan-subjects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlanSubjectsController {
  constructor(private readonly planSubjectsService: PlanSubjectsService) {}

  @ApiBody({ type: CreatePlanSubjectDto })
  @Post()
  create(@Body() dto: CreatePlanSubjectDto) {
    console.log(dto, 'plan-subject.controller.ts');
    return this.planSubjectsService.create(dto);
  }

  // @Get()
  // findAll() {
  //   return this.planSubjectsService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planSubjectsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlanSubjectDto: UpdatePlanSubjectDto,
  ) {
    return this.planSubjectsService.update(+id, updatePlanSubjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planSubjectsService.remove(+id);
  }
}
