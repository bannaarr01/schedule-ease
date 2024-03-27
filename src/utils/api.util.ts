import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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