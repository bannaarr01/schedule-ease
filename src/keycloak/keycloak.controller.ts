import { Body, Controller, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import { KeycloakService } from './keycloak.service';
import { AuthTokenRequestDto } from './dto/auth-token-request.dto';
import { Public } from 'nest-keycloak-connect';
import { LoggerService } from '../logger/logger.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IAuthToken } from './interface/auth-token.interface';

@Controller('auth')
export class KeycloakController {
   constructor(
     private readonly keycloakService: KeycloakService,
     private readonly logger: LoggerService
   ) {

   }
   @Public()
   @Post('token')
   @ApiOperation({ summary: 'Request Auth Token', description: 'Obtain an auth token using a valid user credentials.' })
   @ApiResponse({ status: 200, description: 'Return authentication token.' })
   @ApiResponse({ status: 400, description: 'Bad request with error message.' })
   @ApiResponse({ status: 401, description: 'UnAuthorized request.' })
   @ApiResponse({ status: 500, description: 'Internal Server Error.' })
   @HttpCode(HttpStatus.OK)
   public async getAuthToken(@Body() tokenReqDto: AuthTokenRequestDto) : Promise<IAuthToken> {
      try {
         return await this.keycloakService.getAuthToken(tokenReqDto);
      } catch (error) {
         this.logger.getLogger().error(error.message || error.customErrMsg, KeycloakController.name + ' getAuthToken');
         throw new HttpException(error.customErrMsg || error.message
           || 'Internal Server Error',error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }
}
