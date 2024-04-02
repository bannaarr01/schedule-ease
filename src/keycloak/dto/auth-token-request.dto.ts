import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { GrantType } from '../enums/grant-type';

/**
 * Data transfer object representing the request body for retrieving an authentication token.
 */
export class AuthTokenRequestDto {
  @IsNotEmpty()
  @IsEnum(GrantType)
  @ApiProperty({ enum: GrantType, enumName: 'GrantType' })
     grantType: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
     clientId: string;

  @ApiProperty()
     username: string;

  @ApiProperty()
     password: string;
}