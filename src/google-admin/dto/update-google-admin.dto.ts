import { PartialType } from '@nestjs/swagger';
import { CreateGoogleAdminDto } from './create-google-admin.dto';

export class UpdateGoogleAdminDto extends PartialType(CreateGoogleAdminDto) {}
