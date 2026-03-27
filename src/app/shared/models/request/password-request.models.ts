export interface PasswordChangeRequestDTO {
  oldPassword: string;
  newPassword: string;
}

export interface ResetPasswordByAdminDTO {
  newPassword: string;
}
