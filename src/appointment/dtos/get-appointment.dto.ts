import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { LocationType } from '../enums/location-type';
import { AppointmentStatus, AppointmentStatusID } from '../enums/appointment-status';

export class GetAppointmentDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiPropertyOptional()
     startDateTimeFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiPropertyOptional()
     startDateTimeTo?: Date;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
     creatorId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
     category?: string;

  /** Select {@link AppointmentStatus} and its value of  {@link AppointmentStatusID} */
  @IsOptional()
  @Transform(({ value }) => AppointmentStatusID[value])
  @IsEnum(AppointmentStatusID)
  @ApiPropertyOptional({ enum: AppointmentStatus, enumName: 'AppointmentStatusID' })
     status?: number;

  @IsOptional()
  @IsEnum(LocationType)
  @ApiPropertyOptional({ enum: LocationType, enumName: 'LocationType' })
     locationType?: LocationType;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiPropertyOptional()
     isDescByCreatedAt?: boolean

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @ApiPropertyOptional()
     limit?: number;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @ApiPropertyOptional()
     offset?: number;
}
