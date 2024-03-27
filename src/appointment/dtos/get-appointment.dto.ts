import { IsBoolean, IsDate, IsInt, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAppointmentDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiPropertyOptional()
     startDateTime?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiPropertyOptional()
     endDateTime?: Date;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiPropertyOptional()
     isDesc?: boolean

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
