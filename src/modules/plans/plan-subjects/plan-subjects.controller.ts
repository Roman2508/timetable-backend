import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger'
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UploadedFile,
  ParseFilePipe,
  UseInterceptors,
  MaxFileSizeValidator,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes } from '@nestjs/swagger'

// import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { PlanSubjectsService } from './plan-subjects.service'
import { CreatePlanSubjectDto } from './dto/create-plan-subject.dto'
import { UpdatePlanSubjectNameDto } from './dto/update-plan-subject-name.dto'
import { UpdatePlanSubjectHoursDto } from './dto/update-plan-subject-hours.dto'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { RolesKeyGuard } from 'src/auth/guards/roles-key.guard'

@Controller('plan-subjects')
@ApiTags('plan-subjects')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlanSubjectsController {
  constructor(private readonly planSubjectsService: PlanSubjectsService) {}

  @UseGuards(RolesKeyGuard)
  @Roles('teacher', 'admin')
  @Get('by-row/:rowId')
  findOneByRow(@Param('rowId') rowId: string) {
    return this.planSubjectsService.findOneByRowId(+rowId)
  }

  @Get('/:id')
  @ApiQuery({ name: 'semesters', type: String, required: false })
  findAll(@Param('id') id: string, @Query('semesters') semesters?: string) {
    return this.planSubjectsService.findAll(+id, semesters)
  }

  @ApiBody({ type: CreatePlanSubjectDto })
  @Post()
  create(@Body() dto: CreatePlanSubjectDto) {
    return this.planSubjectsService.create(dto)
  }

  @ApiBody({ type: UpdatePlanSubjectNameDto })
  @Patch('name')
  updateName(@Body() dto: UpdatePlanSubjectNameDto) {
    return this.planSubjectsService.updateName(dto)
  }

  @ApiBody({ type: UpdatePlanSubjectHoursDto })
  @Patch('hours')
  updateHours(@Body() dto: UpdatePlanSubjectHoursDto) {
    return this.planSubjectsService.updateHours(dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.planSubjectsService.remove(+id)
    return id
  }

  // Teacher/admin elective content management
  @UseGuards(RolesKeyGuard)
  @Roles('teacher', 'admin')
  @Patch(':id/elective')
  patchElective(@Param('id') id: string, @Body() dto: { electiveDescription?: string | null }) {
    return this.planSubjectsService.patchElectiveMeta(+id, dto)
  }

  @UseGuards(RolesKeyGuard)
  @Roles('teacher', 'admin')
  @Get(':id/attachments')
  listAttachments(@Param('id') id: string) {
    return this.planSubjectsService.listAttachments(+id)
  }

  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @UseGuards(RolesKeyGuard)
  @Roles('teacher', 'admin')
  @Patch(':id/attachments')
  uploadAttachment(
    @Param('id') id: string,
    @UploadedFile(new ParseFilePipe({ validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 })] }))
    file: any,
  ) {
    return this.planSubjectsService.uploadAttachment(+id, file)
  }

  @UseGuards(RolesKeyGuard)
  @Roles('teacher', 'admin')
  @Delete(':id/attachments/:attachmentId')
  deleteAttachment(@Param('id') id: string, @Param('attachmentId') attachmentId: string) {
    return this.planSubjectsService.deleteAttachment(+id, +attachmentId)
  }
}
