import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {

  @ApiProperty()
  @IsString()
     name: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
     streetNr?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
     streetName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
     postCode?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
     city?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
     stateOrProvince?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
     country?: string;
}