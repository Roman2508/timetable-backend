import { Module } from '@nestjs/common';
import { GoogleAdminService } from './google-admin.service';
import { GoogleAdminController } from './google-admin.controller';

@Module({
  controllers: [GoogleAdminController],
  providers: [GoogleAdminService],
  exports: [GoogleAdminService],
})
export class GoogleAdminModule {}
