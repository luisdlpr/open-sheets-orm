/**
 * @file Google Sheets API authentication service.
 * @module services/GoogleAuthService
 */

import { google, Auth } from 'googleapis';
import type { sheets_v4 } from 'googleapis';
import { GOOGLE_SHEETS_VERSION, GOOGLE_SHEETS_SCOPES } from '../constants';

/**
 * Handles authentication against the Google Sheets API.
 *
 * Creates an authenticated sheets client using service account credentials
 * (JWT) or external account credentials.
 *
 * @example
 * ```ts
 * const service = new GoogleAuthService(credentials);
 * const sheets = await service.authenticate();
 * ```
 */
export class GoogleAuthService {
  constructor(private readonly credentials: Auth.JWTInput) {}

  /**
   * Authenticates with Google and returns a sheets API client.
   *
   * @returns An authenticated Google Sheets v4 client instance.
   */
  async authenticate(): Promise<sheets_v4.Sheets> {
    const auth = new google.auth.GoogleAuth({
      credentials: this.credentials,
      scopes: [...GOOGLE_SHEETS_SCOPES],
    });

    return google.sheets({ version: GOOGLE_SHEETS_VERSION, auth });
  }
}
