import { Get, Post, Body, Patch, Param, Delete, UseGuards, Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { AuditoriesService } from './auditories.service';
// import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CreateAuditoryDto } from './dto/create-auditory.dto';
import { UpdateAuditoryDto } from './dto/update-auditory.dto';

@Controller('auditories')
@ApiTags('auditories')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditoriesController {
  constructor(private readonly auditoriesService: AuditoriesService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditoriesService.findOne(+id);
  }

  @ApiBody({ type: CreateAuditoryDto })
  @Post()
  create(@Body() dto: CreateAuditoryDto) {
    return this.auditoriesService.create(dto);
  }

  @ApiBody({ type: UpdateAuditoryDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAuditoryDto) {
    return this.auditoriesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditoriesService.remove(+id);
  }
}
