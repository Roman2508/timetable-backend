import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFileDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty({ message: 'teacher ID is required' })
    teacherId: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'file ID is required' })
    id: string;
        
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'file name is required' })
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'mime type is required' })
    mimeType: string;
}