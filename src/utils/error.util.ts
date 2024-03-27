import { HttpStatus } from '@nestjs/common';

/**
 * Utility class for handling errors.
 */
export class ErrorUtil {
   /**
   * Throws an error with a custom error message and status code.
   *
   * @param {string} customErrMsg - The custom error message to be thrown.
   * @param {number} statusCode - The HTTP status code to be associated with the error
   * (default: 500 Internal Server Error).
   * @throws {any} - Throws an error object containing the custom error message and status code.
   */
   public static throwError(customErrMsg: string,  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR): void {
      throw {
         customErrMsg,
         statusCode,
      };
   }
}