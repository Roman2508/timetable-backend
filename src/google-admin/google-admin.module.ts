import { Module } from '@nestjs/common';
import { GoogleAdminService } from './google-admin.service';

@Module({
  providers: [GoogleAdminService],
  exports: [GoogleAdminService],
})
export class GoogleAdminModule {}
