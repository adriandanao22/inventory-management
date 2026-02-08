import { User } from "./user";

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}