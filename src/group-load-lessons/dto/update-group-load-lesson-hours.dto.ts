import { ApiProperty } from '@nestjs/swagger';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';

// class planSubjectDto {
//   @ApiProperty()
//   id: number;

//   @ApiProperty()
//   plan: number;

//   @ApiProperty()
//   cmk: number;

//   @ApiProperty()
//   name: string;

//   @ApiProperty()
//   totalHours: number;

//   @ApiProperty()
//   semesterNumber: number | null;

//   @ApiProperty()
//   lectures?: number;

//   @ApiProperty()
//   practical?: number;

//   @ApiProperty()
//   laboratory?: number;

//   @ApiProperty()
//   seminars?: number;

//   @ApiProperty()
//   exams?: number;

//   @ApiProperty()
//   examsConsulation?: number;

//   @ApiProperty()
//   metodologicalGuidance?: number;

//   @ApiProperty()
//   independentWork?: number;
// }

export class UpdateGroupLoadLessonHoursDto {
  @ApiProperty()
  // planSubject: planSubjectDto;
  planSubject: PlanSubjectEntity;

  @ApiProperty()
  planId: number;
}

// export class UpdateGroupLoadLessonHoursDto {
//   @ApiProperty()
//   planSubject: {
//     id: number;
//     name: string;
//     plan: number;
//     cmk: number;
//     totalHours: number;
//     semesterNumber: number | null;
//     lectures?: number;
//     practical?: number;
//     laboratory?: number;
//     seminars?: number;
//     exams?: number;
//     examsConsulation?: number;
//     metodologicalGuidance?: number;
//     independentWork?: number;
//   };

//   @ApiProperty()
//   planId: number;
// }
