import { Body, Controller, HttpCode, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { KeycloakService } from './keycloak.service';
import { AuthTokenRequestDto } from './dto/auth-token-request.dto';
import { AuthenticatedUser, Public, Roles } from 'nest-keycloak-connect';
import { LoggerService } from '../logger/logger.service';
import { IAuthToken } from './interface/auth-token.interface';
import { ApiOperationAndResponses } from '../utils/api.util';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
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
         this.handleError(error, ' getAuthToken');
      }
   }

   @Post('user')
   @Roles({ roles: ['realm:admin']})
   @ApiOperationAndResponses({
      summary: 'Create new user',
      responseDescriptions: {
         [HttpStatus.OK]: 'Returns ok.'
      }
   })
   @HttpCode(HttpStatus.OK)
   public async createUser(
     @Req() req: any,
     @AuthenticatedUser() user: any,
     @Body() createUserDto: CreateUserDto
   ) : Promise<any> {
      try {
         return await this.keycloakService.createAUser(req.accessTokenJWT, user, createUserDto);
      } catch (error) {
         this.handleError(error, ' createUser');
      }
   }

   /**
    * Handles and logs errors that occur within the KeycloakController controller.
    * @param error The error object to be handled.
    * @param context A string indicating the context in which the error occurred.
    * @throws Throws an HttpException with an appropriate status code and error message
    * based on the provided error object.
    */
   public handleError(error: any, context: string): void {
      this.logger.getLogger().error(error.message || error.customErrMsg, error,
         KeycloakController.name + context);
      throw new HttpException(error.customErrMsg || error.message
        || 'Internal Server Error',error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
   }
}
