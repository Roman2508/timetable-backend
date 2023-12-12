import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEntity } from './entities/plan.entity';

@Module({
  controllers: [PlansController],
  providers: [PlansService],
  imports: [TypeOrmModule.forFeature([PlanEntity])],
})
export class PlansModule {}
