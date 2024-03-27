import { Expose, Transform } from 'class-transformer';
import { Participant } from '../entities/participant.entity';
import { ContactMediumDto } from './contact.medium.dto';

export class ParticipantDto {
  @Transform(({ obj }) => obj.map((participantObj: Participant) => ({
     id: participantObj.id,
     name: participantObj.name,
     role: participantObj.role,
     appointmentId: participantObj.appointmentId.id,
     contactMedium: new ContactMediumDto(participantObj.contactMedium),

  })))
  @Expose()
     participants: ParticipantDto[];
}