import { HttpStatus } from '@nestjs/common';

export class ErrorUtil {
   public static throwError(customErrMsg: string,  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR): void {
      throw {
         customErrMsg,
         statusCode,
      };
   }
}