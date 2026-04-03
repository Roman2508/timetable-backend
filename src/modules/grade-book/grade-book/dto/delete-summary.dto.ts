import { PartialType } from '@nestjs/swagger';
import { AddSummaryDto } from './add-summary.dto';

export class DeleteSummaryDto extends PartialType(AddSummaryDto) {}
