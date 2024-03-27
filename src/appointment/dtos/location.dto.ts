import { Expose, Transform } from 'class-transformer';
export class LocationDto {
  @Expose()
     id: number;

  @Expose()
     name: string;

  @Transform(({ obj }) => obj.appointmentId.id)
  @Expose()
     appointmentId: number;

  @Expose()
     streetNr?: string;

  @Expose()
     streetName?: string;

  @Expose()
     postCode?: string;

  @Expose()
     city?: string;

  @Expose()
     stateOrProvince?: string;

  @Expose()
     country?: string;
}
