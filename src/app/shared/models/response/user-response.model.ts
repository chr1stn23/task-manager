export interface UserResponseDTO {
  id: number;
  firstName: string;
  lastName: string;
  nickName: string;
  profileImageUrl: string | null;
  email: string;
  roles: string[];
  enabled: boolean;
}

export interface UserListResponseDTO {
  id: number;
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  profileImageUrl: string | null;
  enabled: boolean;
}
