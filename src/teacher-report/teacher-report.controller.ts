import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { TeacherReportService } from './teacher-report.service';
import { CreateTeacherReportDto } from './dto/create-teacher-report.dto';
import { UpdateTeacherReportDto } from './dto/update-teacher-report.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('teacher-report')
@ApiTags('teacher-report')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeacherReportController {
  constructor(private readonly teacherReportService: TeacherReportService) {}

  @Post()
  create(@Body() dto: CreateTeacherReportDto) {
    return this.teacherReportService.create(dto);
  }

  @Get(':id')
  findByTeacherId(@Param('id') id: string) {
    return this.teacherReportService.findByTeacherId(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeacherReportDto) {
    return this.teacherReportService.update(+id, dto);
  }

  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @Patch('file/:id/')
  uploadFile(
    @Param('id') id: string,
    @UploadedFile(new ParseFilePipe({ validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 })] }))
    file: any,
  ) {
    return this.teacherReportService.uploadFile(+id, file);
  }

  @Delete('/file/:id/:fileId')
  deleteFile(@Param('id') id: string, @Param('fileId') fileId: string) {
    return this.teacherReportService.deleteFile(+id, fileId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherReportService.remove(+id);
  }
}
