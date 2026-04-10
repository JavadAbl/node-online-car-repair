export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  tokenObject: any | null;
  isAuth: boolean;
  user: UserDto | null;
  role: string | null;
};

export interface UserDto {
  id: number;
  mobile: string;
}

export interface AuthDto {
  accessToken: string;
  refreshToken: string;
}
