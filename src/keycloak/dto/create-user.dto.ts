import { IsEmail, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty()
     firstName: string;

  @IsString()
  @ApiProperty()
     lastName: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, { message: 'Username must contain only letters and numbers' })
  @ApiProperty()
     username: string;

  @IsEmail()
  @ApiProperty()
     email: string;

  @IsOptional()
  @ApiPropertyOptional({ default: {}})
     attributes?: Record<string, any>;
}
