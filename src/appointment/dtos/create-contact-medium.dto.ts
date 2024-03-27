import { CreateContactMediumAttributeDto } from './create-contact-medium-attribute.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactMediumDto {
  @ApiProperty({ type: CreateContactMediumAttributeDto })
     attribute: CreateContactMediumAttributeDto;
}
