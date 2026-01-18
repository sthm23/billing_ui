
export interface AuthRequest {
  login: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}
