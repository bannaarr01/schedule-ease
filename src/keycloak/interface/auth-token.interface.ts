/**
 * Interface representing an authentication token received from keycloak auth server.
 */
export interface IAuthToken {
  /**
   * The access token used for authentication.
   */
  access_token: string;
  /**
   * The duration in seconds for which the access token remains valid.
   */
  expires_in: number;
  /**
   * The duration in seconds for which the refresh token remains valid.
   */
  refresh_expires_in: number;
  /**
   * The refresh token used to obtain a new access token.
   */
  refresh_token: string;
  /**
   * The type of token issued. Typically, this will be "Bearer".
   */
  token_type: string;
  /**
   * The scope of the access granted by the token.
   */
  scope: string;
  /**
   * The user token associated with the authentication session.
   */
  user_token: string;
  /**
   * The session state associated with the authentication session.
   */
  session_state: string;
}