import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
// import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@Controller('plans')
@ApiTags('plans')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @ApiBody({ type: CreatePlanDto })
  @Post()
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(+id);
  }

  @ApiBody({ type: UpdatePlanDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plansService.remove(+id);
  }
}
