import { PartialType } from '@nestjs/swagger';
import { CreateAuditoryDto } from './create-auditory.dto';

export class UpdateAuditoryDto extends PartialType(CreateAuditoryDto) {}
