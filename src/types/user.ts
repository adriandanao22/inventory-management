export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  low_stock_limit: number;
  avatar_url?: string;
  created_at: string;
}

// Omit password for client-side usage
export type SafeUser = Omit<User, "password">;