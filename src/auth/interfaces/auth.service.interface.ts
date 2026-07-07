/**
 * Abstract class representing the Authentication Port.
 * Defines the contract for validating tokens, adhering to the Adapter Pattern.
 */
export abstract class IAuthService {
  /**
   * Validates a bearer token and returns the user payload.
   * @param token The JWT bearer token extracted from the request.
   * @returns The user data or payload if the token is valid.
   */
  abstract validateToken(token: string): Promise<any>;
}
