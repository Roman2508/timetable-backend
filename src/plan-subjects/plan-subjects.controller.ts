import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlanSubjectsService } from './plan-subjects.service';
import { CreatePlanSubjectDto } from './dto/create-plan-subject.dto';
import { UpdatePlanSubjectDto } from './dto/update-plan-subject.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('plan-subjects')
@ApiTags('plan-subjects')
export class PlanSubjectsController {
  constructor(private readonly planSubjectsService: PlanSubjectsService) {}

  // @Post()
  // create(@Body() createPlanSubjectDto: CreatePlanSubjectDto) {
  //   return this.planSubjectsService.create(createPlanSubjectDto);
  // }

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
