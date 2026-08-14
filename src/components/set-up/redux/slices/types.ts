import { ResponseType } from 'axios';

// slices/types.ts
export interface AuthState {
  login: {
    token: string | null;
    expiresAt: number | null;
    status: boolean;
    error: string | null;
  };
}

export interface RootState {
  auth: AuthState;
}

export interface AsyncData {
  data: any | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginData {
  token: string | null;
  data: any | null;
  expiresAt: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface DownloadRequestParams {
  type: string;
  startDate: string;
  endDate: string;
  responseType?: ResponseType;
}

export interface InitialState {
  login: LoginData;
  profile: AsyncData;
  admins: AsyncData;
  admin: AsyncData;
}

