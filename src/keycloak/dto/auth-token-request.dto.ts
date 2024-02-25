import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object representing the request body for retrieving an authentication token.
 */
export class AuthTokenRequestDto {
  @ApiProperty()
     username: string;

  @ApiProperty()
     password: string;
}