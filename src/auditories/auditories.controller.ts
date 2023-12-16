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
import { AuditoriesService } from './auditories.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateAuditoryDto } from './dto/create-auditory.dto';
import { UpdateAuditoryDto } from './dto/update-auditory.dto';

@Controller('auditories')
@ApiTags('auditories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditoriesController {
  constructor(private readonly auditoriesService: AuditoriesService) {}

  @Get()
  findAll() {
    return this.auditoriesService.findAll();
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
