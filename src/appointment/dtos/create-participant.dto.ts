import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateContactMediumDto } from './create-contact-medium.dto';

export class CreateParticipantDto {
  @IsString()
  @ApiProperty()
     name: string;

  @IsString()
  @ApiProperty()
     role: string;

  @ApiProperty({ type: CreateContactMediumDto })
     contactMedium: CreateContactMediumDto;
}
