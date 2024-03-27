import { IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CreateNoteDto {
  @IsString()
  @ApiProperty()
     text: string;
}

export class CreateNotesDto {
  @ApiProperty({ type: [CreateNoteDto] })
  @ValidateNested({ each: true })
     note: CreateNoteDto[];
}

