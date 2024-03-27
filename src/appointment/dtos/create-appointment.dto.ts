import { IsDate, IsEnum, IsNotEmpty, IsString, IsUrl, ValidateIf, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateParticipantDto } from './create-participant.dto';
import { CreateLocationDto } from './create-location.dto';
import { LocationType } from '../enums/location-type';

export class CreateAppointmentDto {
  @IsString()
  @ApiProperty()
     description: string;

  @IsString()
  @ApiProperty()
     category?: string;

  @IsDate()
  @Type(() => Date)
  @ApiProperty()
     validForStartDateTime: Date;

  @IsDate()
  @Type(() => Date)
  @ApiProperty()
     validForEndDateTime: Date;

  @ApiProperty({ type: [CreateParticipantDto] })
  @ValidateNested({ each: true })
     participant: CreateParticipantDto[];

  @ApiProperty({ type: CreateLocationDto })
     location: CreateLocationDto;

  @IsEnum(LocationType)
  @ApiProperty({ enum: LocationType, enumName: 'LocationType' })
     locationType: LocationType;

  @IsUrl()
  @ValidateIf(obj => obj.locationType === LocationType.ONLINE)
  @IsNotEmpty({ message: 'Location or meeting link is required for online appointments.' })
  @ApiProperty()
     locationLink?: string;

}