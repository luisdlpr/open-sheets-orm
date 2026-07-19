import { google } from 'googleapis';

export interface GoogleCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

export class GoogleSheetsAdapter {
  credentials: GoogleCredentials;

  constructor(credentials: GoogleCredentials) {
    this.credentials = credentials;
  }

  async main() {
    const auth = new google.auth.GoogleAuth({
      credentials: this.credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets', // TODO: some enum config file or constants
      ],
    });

    const sheets = google.sheets({
      version: 'v4',
      auth,
    });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '1p3FMsiVMQaLeZSOUrNQJe1HD50uAp821KMrxH7_Qi9g',
      range: 'Sheet1!A:B',
    });

    console.log(response);
    console.log(response.data.values);
  }
}

// import { google } from "googleapis";
// import credentials from "./credentials.json";
//
//
// async function main() {
//
//   const auth = new google.auth.GoogleAuth({
//
//     credentials,
//
//     scopes: [
//       "https://www.googleapis.com/auth/spreadsheets"
//     ]
//
//   });
//
//
//   const sheets = google.sheets({
//     version: "v4",
//     auth
//   });
//
//
//   const response = await sheets.spreadsheets.values.get({
//
//     spreadsheetId: "YOUR_SPREADSHEET_ID",
//
//     range: "Users!A:C"
//
//   });
//
//
//   console.log(response.data.values);
//
// }
//
//
// main();
