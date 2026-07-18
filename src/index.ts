import { GoogleSheetsAdapter } from "./adapters/GoogleSheetsAdapter";
import credentials from "../.keys/open-sheets-orm-447e9f38f287.json";

export * from "./adapters/GoogleSheetsAdapter";


const adapter = new GoogleSheetsAdapter(credentials);
adapter.main();
