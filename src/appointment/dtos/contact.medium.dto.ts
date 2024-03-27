import { Expose, Type } from 'class-transformer';
import { ContactMedium } from '../entities/contact-medium.entity';
import { ContactMediumAttributeDto } from './contact-medium-attribute.dto';

export class ContactMediumDto {
  @Expose()
     id: number;

  @Type(() => Number)
  @Expose()
     participantId: number;

  @Expose()
     mediumType?: string;

  @Type(() => ContactMediumAttributeDto)
  @Expose()
     attribute: ContactMediumAttributeDto

  constructor(contactMedium: ContactMedium) {
     this.id = contactMedium.id;
     this.participantId = contactMedium.participantId.id;
     this.mediumType = contactMedium.mediumType;
     this.attribute = new ContactMediumAttributeDto(contactMedium.attribute);
  }
}