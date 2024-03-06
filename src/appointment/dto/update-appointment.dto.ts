import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { LocationType } from '../entities/location-type';
import { Type } from 'class-transformer';

export class UpdateAppointmentDto {
  // @IsString()
  // attachmentType: string;
  //
  // @IsString()
  // mimeType: string;
  //
  // @IsString()
  // originalName: string;
  //
  // @IsString()
  // path: string;
  //
  // @IsNumber()
  // size: number;
  //
  // @IsOptional()
  // @IsString()
  // content?: string;
  //
  // @IsOptional()
  // @IsString()
  // description?: string;
  //
  // @IsDate()
  // @Type(() => Date)
  // @ApiProperty()
  // validForStartDateTime: Date;
  //
  // @IsDate()
  // @Type(() => Date)
  // @ApiProperty()
  // validForEndDateTime: Date;
  //
  // @IsEnum(LocationType)
  // @IsOptional()
  // @ApiPropertyOptional({ enum: LocationType, enumName: 'LocationType' })
  // locationType?: LocationType;
  //
  // @IsString()
  // @IsOptional()
  // @ApiPropertyOptional()
  // locationLink?: string;
}