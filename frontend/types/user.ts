export type UserRole = "USER" | "ADMIN";

export type AccountStatus = "ACTIVE" | "DISABLED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  joinedAt: string;
}
