// For session-based auth. This need to be included to extended the type of session data.

import "express-session";

declare module "express-session" {
  interface SessionData {
    username?: string;
    // And more property for data to be stored in.
  }
}

export {};