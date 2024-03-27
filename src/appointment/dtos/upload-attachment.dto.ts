import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UploadAttachmentDto {
  @ApiProperty({ type: 'string', format: 'binary'})
     file: any;

  @IsString()
  @ApiPropertyOptional()
     description?: string;
}