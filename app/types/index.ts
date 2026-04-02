export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  MANAGER = "MANAGER",
  GUEST = "GUEST",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId?: string;
  team?: Team;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  code: string;
  memebers: User[];
  createdAt: Date;
  updatedAt: Date;
}