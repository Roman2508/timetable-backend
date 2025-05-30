import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';

import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';
import { GoogleAdminModule } from 'src/google-admin/google-admin.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([UserEntity]), GoogleAdminModule],
  exports: [UsersService,],
})
export class UsersModule {}
