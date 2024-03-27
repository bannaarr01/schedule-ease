import { Body, Controller, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import { KeycloakService } from './keycloak.service';
import { AuthTokenRequestDto } from './dto/auth-token-request.dto';
import { Public } from 'nest-keycloak-connect';
import { LoggerService } from '../logger/logger.service';
import { IAuthToken } from './interface/auth-token.interface';
import { ApiOperationAndResponses } from '../utils/api.util';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class KeycloakController {
   constructor(
     private readonly keycloakService: KeycloakService,
     private readonly logger: LoggerService
   ) {

   }
   @Public()
   @Post('token')
   @ApiOperationAndResponses({
      summary: 'Request Auth Token',
      description: 'Obtain an auth token using valid user credentials.',
      responseDescriptions: {
         [HttpStatus.OK]: 'Return authentication token.'
      }
   })
   @HttpCode(HttpStatus.OK)
   public async getAuthToken(@Body() tokenReqDto: AuthTokenRequestDto) : Promise<IAuthToken> {
      try {
         return await this.keycloakService.getAuthToken(tokenReqDto);
      } catch (error) {
         this.logger.getLogger().error(error.message || error.customErrMsg, error,
            KeycloakController.name + ' getAuthToken');
         throw new HttpException(error.customErrMsg || error.message
           || 'Internal Server Error',error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }
}
