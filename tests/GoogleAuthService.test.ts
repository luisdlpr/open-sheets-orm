import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleAuthService } from '../src/services/GoogleAuthService';
import { GOOGLE_SHEETS_VERSION, GOOGLE_SHEETS_SCOPES } from '../src/constants';

vi.mock('googleapis', () => {
  const mockSheets = { spreadsheets: {} };
  return {
    google: {
      auth: {
        GoogleAuth: vi.fn().mockImplementation(function (
          this: Record<string, unknown>,
          opts: unknown,
        ) {
          Object.assign(this, opts);
          return this;
        }),
      },
      sheets: vi.fn().mockReturnValue(mockSheets),
    },
  };
});

describe('GoogleAuthService', () => {
  let service: GoogleAuthService;
  const mockCredentials = { type: 'service_account' } as never;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GoogleAuthService(mockCredentials);
  });

  it('creates a sheets client with correct version', async () => {
    const { google } = await import('googleapis');

    await service.authenticate();

    expect(google.sheets).toHaveBeenCalledWith(
      expect.objectContaining({ version: GOOGLE_SHEETS_VERSION }),
    );
  });

  it('passes credentials and scopes to GoogleAuth', async () => {
    const { google } = await import('googleapis');

    await service.authenticate();

    expect(google.auth.GoogleAuth).toHaveBeenCalledWith({
      credentials: mockCredentials,
      scopes: GOOGLE_SHEETS_SCOPES,
    });
  });

  it('returns the sheets client', async () => {
    const { google } = await import('googleapis');

    const result = await service.authenticate();

    expect(result).toBe(google.sheets('v4'));
  });
});
