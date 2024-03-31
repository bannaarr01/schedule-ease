import { BeforeCreate, BeforeUpdate, Cascade, Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ContactMediumType } from '../enums/contact-medium-type';
import { ContactMediumAttribute } from './contact-mendium-attriibute.entity';
import { Participant } from './participant.entity';
import { ErrorUtil } from '../../utils/error.util';
import { HttpStatus } from '@nestjs/common';

@Entity()
export class ContactMedium {
  @PrimaryKey()
     id: number;

  @OneToOne(() => ContactMediumAttribute, attribute => attribute.contactMediumId,
     { owner: true, eager: true, cascade: [Cascade.ALL] })
     attribute: ContactMediumAttribute;

  @OneToOne(()=> Participant, participant => participant.contactMedium)
     participantId: Participant;

  @Property()
     mediumType?: ContactMediumType;

  @BeforeCreate()
  @BeforeUpdate()
  async updateMediumType() {
     switch (true) {
     case !!this.attribute.phoneNumber && !!this.attribute.email && !!this.attribute.city:
        this.mediumType = ContactMediumType.EMAIL_PHONE_NUMBER_ADDRESS;
        break;
     case !!this.attribute.phoneNumber && !!this.attribute.email:
        this.mediumType = ContactMediumType.EMAIL_PHONE_NUMBER;
        break;
     case !!this.attribute.phoneNumber && !!this.attribute.city:
        this.mediumType = ContactMediumType.PHONE_NUMBER_ADDRESS;
        break;
     case !!this.attribute.email && !!this.attribute.city:
        this.mediumType = ContactMediumType.EMAIL_ADDRESS;
        break;
     case !!this.attribute.phoneNumber:
        this.mediumType = ContactMediumType.PHONE_NUMBER;
        break;
     case !!this.attribute.email:
        this.mediumType = ContactMediumType.EMAIL;
        break;
     case !!this.attribute.city:
        this.mediumType = ContactMediumType.ADDRESS;
        break;
     default:
        ErrorUtil.throwError('Either phoneNumber or email is required.',
           HttpStatus.UNPROCESSABLE_ENTITY);
        break;
     }
  }

}