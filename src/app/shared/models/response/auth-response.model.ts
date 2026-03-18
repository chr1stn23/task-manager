export interface AuthResponseDTO {
  token: string;
}

export interface SessionResponseDTO {
  id: number;
  deviceName: string;
  ipAddress: string;
  agentName: string;
  createdAt: string; // ISO string format
  current: boolean; // Indicates if this session is the current active session
}
