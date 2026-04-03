import { PartialType } from '@nestjs/swagger';
import { CreateStreamDto } from './create-stream.dto';

export class UpdateStreamNameDto extends PartialType(CreateStreamDto) {}
