import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class RescheduleAppointmentDto{
  @IsDate()
  @Type(() => Date)
  @ApiProperty()
     validForStartDateTime: Date;

  @IsDate()
  @Type(() => Date)
  @ApiProperty()
     validForEndDateTime: Date;
}