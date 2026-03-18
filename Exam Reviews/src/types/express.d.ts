// You may need to extend the type of request to put payload data in it for jwt.
import { Express } from 'express-serve-static-core';

declare global {
    namespace Express {
        interface Request {
            username?: string
        }
    }
}

export {}