import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Get, Body, Patch, Param, UseGuards, Controller } from '@nestjs/common';

import { SettingsService } from './settings.service';
import { UpdateColorDto } from './dto/update-color.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { UpdateCallScheduleDto } from './dto/update-call-schedule.dto';
import { UpdateSemesterTermsDto } from './dto/update-semester-terms.dto';

@Controller('settings')
@ApiTags('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':id')
  find(@Param('id') id: string) {
    return this.settingsService.find(+id);
  }

  // @Post('')
  // create(@Body() dto: UpdateSettingDto) {
  //   return this.settingsService.create(dto);
  // }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('colors')
  updateColor(@Body() dto: UpdateColorDto) {
    return this.settingsService.updateColor(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('call-schedule')
  updateCallSchedule(@Body() dto: UpdateCallScheduleDto) {
    return this.settingsService.updateCallSchedule(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('semester-terms')
  updateSemesterTerms(@Body() dto: UpdateSemesterTermsDto) {
    return this.settingsService.updateSemesterTerms(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.update(+id, dto);
  }
}
