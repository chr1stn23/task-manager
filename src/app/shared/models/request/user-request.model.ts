import { Role } from '../enums';

// For Admin to create a new user
export interface UserCreateDTO {
  firstName: string;
  lastName?: string;
  nickName: string;
  email: string;
  password: string;
  role: Role[];
  enabled: boolean;
}

// For Admin to update an existing user
export interface UserUpdateByAdminDTO {
  firstName: string;
  lastName?: string;
  nickName: string;
  email: string;
  role?: Role[];
  enabled?: boolean;
}

// For User to update their own profile
export interface UserUpdateBySelfDTO {
  firstName: string;
  lastName?: string;
  nickName: string;
  email: string;
}
