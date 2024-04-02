/**
 * Enum representing different grant types.
 */
export enum GrantType {
  /**
   * Grant type for using a username and password for authentication.
   */
  PASSWORD = 'password',

  /**
   * Grant type for using a refresh token to obtain a new access token.
   */
  REFRESH_TOKEN = 'refresh_token',

  /**
   * Grant type for exchanging an authorization code for an access token.
   */
  AUTHORIZATION_CODE = 'authorization_code',

  /**
   * Grant type for obtaining access tokens based on the client's credentials.
   */
  CLIENT_CREDENTIALS = 'client_credentials',
}
