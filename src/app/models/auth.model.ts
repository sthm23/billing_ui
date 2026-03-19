import { Store } from "./store.model";
import { AuthAccount, Staff, UserRole, UserType } from "./user.model";

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

export interface CurrentUserType {
  id: string;
  role: UserRole
  login: string;
  image: string | null;
  fullName: string;
  phone: string;
  stores: Store[]
  auth: AuthAccount | null;
  createdAt: string
  staff: Staff | null
  type: UserType
}
