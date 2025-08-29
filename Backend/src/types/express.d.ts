import type { IUser } from './index';

declare global {
  namespace Express {
    // Make Express.User match our application's user document
    interface User extends IUser {}
  }
}

export {};


