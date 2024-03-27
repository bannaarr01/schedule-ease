import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactMediumAttributeDto {
  @IsString()
  @ValidateIf(obj => !obj.email) // Validate only if email is not provided
  @IsNotEmpty({ message: 'Either phoneNumber or email is required' })
  @ApiPropertyOptional()
     phoneNumber?: string;

  @IsString()
  @ValidateIf(obj => !obj.phoneNumber) // Validate only if phoneNumber is not provided
  @IsNotEmpty({ message: 'Either phoneNumber or email is required' })
  @ApiPropertyOptional()
     email?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
     faxNumber?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
     socialNetworkId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
     street?: string;

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