import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { LocationType } from '../entities/location-type';
import { Type } from 'class-transformer';

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
  
  @IsEnum(LocationType)
  @IsOptional()
  @ApiPropertyOptional({ enum: LocationType, enumName: 'LocationType' })
     locationType?: LocationType;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
     locationLink?: string;
}