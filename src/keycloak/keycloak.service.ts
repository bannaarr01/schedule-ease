import * as qs from 'qs';
import { ErrorUtil } from '../utils/utils';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthTokenRequestDto } from './dto/auth-token-request.dto';
import { IAuthToken } from './interface/auth-token.interface';

@Injectable()
export class KeycloakService {
   private readonly baseURL: string;
   private readonly keycloakRealm: string;
   private readonly clientID: string;
   private readonly clientSecret: string;

   /**
    * Initializes KeycloakService with HTTP service dependency.
    * @param httpService for making requests.
    */
   constructor(private httpService: HttpService){
      this.baseURL = process.env.KEYCLOAK_BASE_URL;
      this.keycloakRealm = process.env.KEYCLOAK_REALM;
      this.clientID = process.env.KEYCLOAK_CLIENT_ID;
      this.clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
   }

   /**
    * Retrieves authentication token from Keycloak server.
    * @param credential The credential information for authentication, type {@link AuthTokenRequestDto}.
    * @returns A promise that resolves to the authentication token response.
    */
   public async getAuthToken(credential: AuthTokenRequestDto): Promise<IAuthToken> {
      try {
         const authTokenResponse = await this.httpService.axiosRef({
            baseURL: this.baseURL,
            url: `/realms/${this.keycloakRealm}/protocol/openid-connect/token`,
            method: 'POST',
            headers: {
               'Accept': 'application/x-www-form-urlencoded',
               'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify({
               grant_type: 'password',
               client_id: this.clientID,
               client_secret: this.clientSecret,
               username: credential.username,
               password: credential.password
            }),
         });
         return authTokenResponse.data;
      } catch (error){
         this.processErrorResponse(error)
      }
   }

   /**
    * Handles errors from HTTP requests.
    * If the error is a timeout or connection-related, throws a connection timeout error.
    * If the error contains specific error descriptions, throws an unauthorized error with the description.
    * Otherwise, throws a generic error.
    * @param error The error object to be processed.
    */
   private processErrorResponse(error: any): void {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
         ErrorUtil.throwError(`Connection timed out: ${error.message}`);
      } else if (error.response?.data?.error_description || error.response?.data?.error) {
         ErrorUtil.throwError(error.response?.data?.error_description
           || error.response?.data?.error, HttpStatus.UNAUTHORIZED);
      } else {
         throw new Error(error.message);
      }
   }
}
