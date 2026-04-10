import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'

import { ElectivesService } from './electives.service'
import { CreateElectiveSessionDto } from './dto/create-elective-session.dto'
import { PatchElectiveSessionChoiceDto } from './dto/patch-elective-session-choice.dto'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { RolesKeyGuard } from 'src/auth/guards/roles-key.guard'

@ApiTags('Electives')
@Controller('electives')
export class ElectivesController {
  constructor(private electivesService: ElectivesService) {}

  // Admin endpoints (RBAC enforcement can be added later)
  @UseGuards(RolesKeyGuard)
  @Roles('admin')
  @Get('sessions')
  async listSessions() {
    return this.electivesService.listSessions()
  }

  @UseGuards(RolesKeyGuard)
  @Roles('admin')
  @Post('sessions')
  async createSession(@Body() dto: CreateElectiveSessionDto, @Req() req: Request) {
    // @ts-ignore
    const userId = req.user?.id
    return this.electivesService.createSession(dto, userId)
  }

  @UseGuards(RolesKeyGuard)
  @Roles('admin')
  @Patch('sessions/:id/open')
  async open(@Param('id') id: string) {
    return this.electivesService.openSession(+id)
  }

  @UseGuards(RolesKeyGuard)
  @Roles('admin')
  @Patch('sessions/:id/close')
  async close(@Param('id') id: string) {
    return this.electivesService.closeSession(+id)
  }

  @UseGuards(RolesKeyGuard)
  @Roles('admin')
  @Patch('sessions/:id/distribute-chosen')
  async distributeChosen(@Param('id') id: string) {
    return this.electivesService.distributeChosen(+id)
  }

  @UseGuards(RolesKeyGuard)
  @Roles('admin')
  @Patch('sessions/:id/distribute-non-choosers')
  async distributeNonChoosers(@Param('id') id: string) {
    return this.electivesService.distributeNonChoosers(+id)
  }

  @UseGuards(RolesKeyGuard)
  @Roles('admin')
  @Get('sessions/:id/results')
  async results(@Param('id') id: string) {
    return this.electivesService.getResults(+id)
  }

  @UseGuards(RolesKeyGuard)
  @Roles('admin')
  @Patch('sessions/:id/override/:studentId')
  async override(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @Body() body: { semesters: Record<string, number[]> },
  ) {
    return this.electivesService.manualOverride(+id, +studentId, body?.semesters ?? {})
  }

  @UseGuards(RolesKeyGuard)
  @Roles('admin')
  @Delete('sessions/:id/overrides')
  async resetOverrides(@Param('id') id: string) {
    return this.electivesService.resetOverrides(+id)
  }

  @UseGuards(RolesKeyGuard)
  @Roles('admin')
  @Delete('sessions/:id/overrides/:studentId')
  async resetOverridesStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.electivesService.resetOverrides(+id, +studentId)
  }

  @UseGuards(RolesKeyGuard)
  @Roles('admin')
  @Patch('sessions/:id/finalize')
  async finalize(@Param('id') id: string) {
    return this.electivesService.finalize(+id)
  }

  @UseGuards(RolesKeyGuard)
  @Roles('admin')
  @Delete('sessions/:id')
  async deleteSession(@Param('id') id: string) {
    return this.electivesService.deleteSession(+id)
  }

  @UseGuards(RolesKeyGuard)
  @Roles('admin')
  @Get('sessions/:id')
  async getSession(@Param('id') id: string) {
    return this.electivesService.getSession(+id)
  }

  // Student endpoints
  @UseGuards(RolesKeyGuard)
  @Roles('student')
  @Get('active')
  async activeForStudent(@Req() req: Request) {
    // @ts-ignore
    const studentId = req.user?.student?.id
    return this.electivesService.listActiveSessionsForStudent(studentId)
  }

  @UseGuards(RolesKeyGuard)
  @Roles('student')
  @Get('sessions/:id/options')
  async options(@Param('id') id: string, @Req() req: Request) {
    // @ts-ignore
    const studentId = req.user?.student?.id
    return this.electivesService.getOptions(+id, studentId)
  }

  @UseGuards(RolesKeyGuard)
  @Roles('student')
  @Patch('sessions/:id/choice')
  async patchChoice(@Param('id') id: string, @Body() dto: PatchElectiveSessionChoiceDto, @Req() req: Request) {
    // @ts-ignore
    const studentId = req.user?.student?.id
    return this.electivesService.patchChoice(+id, studentId, dto.prioritiesBySemester)
  }
}

