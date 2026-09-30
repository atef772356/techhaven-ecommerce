export type UserRole = "USER" | "ADMIN";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
};
