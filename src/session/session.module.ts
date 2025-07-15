import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { SessionService } from './session.service';

@Module({
  providers: [SessionService, SessionService],
  imports: [AuthModule],
})
export class SessionModule {}
