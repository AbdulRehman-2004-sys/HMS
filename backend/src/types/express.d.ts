import { users } from '../db/schema';

export interface UserSessionPayload {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: UserSessionPayload;
    }
  }
}
