import {
  Get,
  Body,
  Post,
  Patch,
  Param,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { SettingsService } from './settings.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UpdateSettingDto } from './dto/update-setting.dto';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.update(+id, dto);
  }
}
