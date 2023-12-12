import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { PlansModule } from './plans/plans.module';
import { PlanCategoriesModule } from './plan-categories/plan-categories.module';
import { PlanSubjectsModule } from './plan-subjects/plan-subjects.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanCategoryEntity } from './plan-categories/entities/plan-category.entity';
import { PlanEntity } from './plans/entities/plan.entity';
import { PlanSubjectEntity } from './plan-subjects/entities/plan-subject.entity';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UserEntity } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [PlanCategoryEntity, PlanEntity, PlanSubjectEntity, UserEntity],
      synchronize: true,
    }),
    PlansModule,
    PlanCategoriesModule,
    PlanSubjectsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
