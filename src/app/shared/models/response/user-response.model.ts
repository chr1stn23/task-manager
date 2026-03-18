export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  roles: string[];
  enabled: boolean;
}

export interface UserListResponseDTO {
  id: number;
  name: string;
  email: string;
  enabled: boolean;
}
