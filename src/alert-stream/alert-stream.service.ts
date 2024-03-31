import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as qs from 'qs';
import { ErrorCode } from '../keycloak/enums/error-code';
import { ErrorUtil } from '../utils/error.util';
import * as process from 'process';

@Injectable()
export class AlertStreamService {
   private readonly baseURL: string;
   private readonly keycloakRealm: string;
   private readonly clientID: string;
   private readonly redirectURI: string;
   constructor(
     private readonly httpService: HttpService,
   ) {
      this.clientID = process.env.CLIENT_ID;
      this.baseURL = process.env.KEYCLOAK_BASE_URL;
      this.keycloakRealm = process.env.KEYCLOAK_REALM;
      this.redirectURI = process.env.REDIRECT_URI || '';
   }

   public async setupPasswordEmail(accessTokenJWT: string, userId: string): Promise<any> {
      try {
         return await this.httpService.axiosRef({
            baseURL: this.baseURL,
            url: `admin/realms/${this.keycloakRealm}/users/${userId}/execute-actions-email`,
            method: 'PUT',
            headers: {
               Authorization: `Bearer ${accessTokenJWT}`,
               'Content-Type': 'application/json'
            },
            params: {
               client_id: this.clientID,
               redirect_uri: this.redirectURI
            },
            data: ['UPDATE_PASSWORD']
         })
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
   public processErrorResponse(error: any): void {
      if (error.code === ErrorCode.ECONNABORTED || error.code === ErrorCode.ETIMEDOUT) {
         ErrorUtil.throwError(`Connection timed out: ${error.message}`);
      } else if (error.response?.data?.error_description || error.response?.data?.error) {
         ErrorUtil.throwError(error.response?.data?.error_description
           || error.response?.data?.error, HttpStatus.UNAUTHORIZED);
      } else {
         throw new Error(error.message);
      }
   }
}
