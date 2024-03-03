import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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

/**
 * Decorator for specifying API operation and responses.
 *
 * @param {Object} options - The options object containing summary, description, and responseDescriptions.
 * @param {string} options.summary - A brief summary of the API operation.
 * @param {string} options.description - A detailed description of the API operation.
 * @param {Object} options.responseDescriptions - A mapping of HTTP status codes to their
 * corresponding response descriptions.
 * @returns {Function} - A decorator function.
 */
export const ApiOperationAndResponses = ({
   summary = '',
   description = '',
   responseDescriptions: providedResponseDescriptions = {},
} = {}) => {
   // Default response descriptions for common HTTP status codes.
   const defaultResponseDescriptions = {
      [HttpStatus.OK]: 'OK',
      [HttpStatus.CREATED]: 'Created',
      [HttpStatus.BAD_REQUEST]: 'Bad request with error message.',
      [HttpStatus.UNAUTHORIZED]: 'UnAuthorized request.',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable entity.',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error.',
   };

   // Merge provided response descriptions with default descriptions.
   const responseDescriptions = { ...defaultResponseDescriptions, ...providedResponseDescriptions };

   return function(target, key, descriptor) {
      return applyDecorators(
         // Apply ApiOperation decorator with provided summary and description.
         ApiOperation({ summary, description: description }),
         // Apply ApiResponse decorators for each response description.
         ...Object.entries(responseDescriptions)
            .map(([status, description]) => ApiResponse({ status: +status, description })),
      )(target, key, descriptor);
   };
}
