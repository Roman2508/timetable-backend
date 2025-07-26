import { Get, Post, Body, Patch, Param, Delete, UseGuards, Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
// import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CreateGroupSpecializationDto } from './dto/create-group-specialization.dto';
import { UpdateGroupSpecializationDto } from './dto/update-group-specialization.dto';

@Controller('groups')
@ApiTags('groups')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  @ApiBody({ type: CreateGroupDto })
  @Post()
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto);
  }

  @Patch('/handle-visible/:id')
  handleGroupVisible(@Param('id') id: string) {
    return this.groupsService.handleGroupVisible(+id);
  }

  @ApiBody({ type: CreateGroupSpecializationDto })
  @Post('/specialization')
  createSpecialization(@Body() dto: CreateGroupSpecializationDto) {
    return this.groupsService.createSpecialization(dto);
  }

  @ApiBody({ type: UpdateGroupSpecializationDto })
  @Patch('/specialization')
  updateSpecialization(@Body() dto: UpdateGroupSpecializationDto) {
    return this.groupsService.updateSpecialization(dto);
  }

  @Delete('/specialization/:id/:name')
  deleteSpecialization(@Param('id') id: string, @Param('name') name: string) {
    return this.groupsService.deleteSpecialization(+id, name);
  }

  @Patch('/increment-all-groups-course')
  incrementAllGroupsCourse() {
    return this.groupsService.incrementAllGroupsCourse();
  }

  @Patch('/decrement-all-groups-course')
  decrementAllGroupsCourse() {
    return this.groupsService.decrementAllGroupsCourse();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id);
  }
}
