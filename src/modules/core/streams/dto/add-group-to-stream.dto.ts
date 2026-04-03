import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateStreamDto } from './create-stream.dto';

export class AddGroupToStreamDto {
  @ApiProperty()
  groupId: number;
}
