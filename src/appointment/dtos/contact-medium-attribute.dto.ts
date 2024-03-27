import { Expose, Type } from 'class-transformer';
import { ContactMediumAttribute } from '../entities/contact-mendium-attriibute.entity';

export class ContactMediumAttributeDto {
  @Expose()
     id: number;

  @Expose()
     phoneNumber?: string;

  @Expose()
     email?: string;

  @Expose()
     faxNumber?: string;

  @Expose()
     socialNetworkId?: string;

  @Expose()
     street?: string;

  @Expose()
     city?: string;

  @Expose()
     stateOrProvince?: string;

  @Expose()
     country?: string;

  @Type(() => Number)
  @Expose()
     contactMediumId: number;

  constructor(attribute: ContactMediumAttribute) {
     const { id, contactMediumId, ...rest } = attribute;
     this.id = id;
     this.contactMediumId = contactMediumId.id;
     Object.entries(rest).forEach(([key, value]) => value && (this[key] = value));
  }
}