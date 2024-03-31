import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { GrantType } from '../enums/grant-type';

/**
 * Data transfer object representing the request body for retrieving an authentication token.
 */
export class AuthTokenRequestDto {

  @IsString()
  @IsNotEmpty()
  @IsEnum(GrantType)
  @ApiProperty({ enum: GrantType, enumName: 'GrantType' })
     grantType: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
     clientId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
     realmName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
     username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
     password: string;
}
