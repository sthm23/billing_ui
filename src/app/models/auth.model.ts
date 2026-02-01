
export interface AuthRequest {
  login: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface LogoutRequest {
  isAllDevices: boolean;
  sessionId: string;
}
