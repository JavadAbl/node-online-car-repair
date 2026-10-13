import type { PayloadAction, WritableDraft } from "@reduxjs/toolkit";
import type { AuthState, UserDto } from "./auth-types";

export const authReducers = {
  logout: (state: WritableDraft<AuthState>) => {
    state.accessToken = null;
    state.isAuth = false;
    state.tokenObject = null;
    state.refreshToken = null;
    state.user = null;
    state.role = null;
  },

  login: (
    state: WritableDraft<AuthState>,
    action: PayloadAction<{
      accessToken: string;
      refreshToken: string;
      tokenObject: any;
      user: UserDto;
      role: string;
    }>,
  ) => {
    const { accessToken, tokenObject, user, refreshToken, role } =
      action.payload;
    state.accessToken = accessToken;
    state.tokenObject = tokenObject;
    state.isAuth = true;
    state.user = user;
    state.refreshToken = refreshToken;
    state.role = role;
  },

  setTokens: (
    state: WritableDraft<AuthState>,
    action: PayloadAction<{
      accessToken: string;
      refreshToken: string;
    }>,
  ) => {
    const { accessToken, refreshToken } = action.payload;
    state.accessToken = accessToken;
    state.refreshToken = refreshToken;
  },

  setAccessToken: (
    state: WritableDraft<AuthState>,
    action: PayloadAction<{
      accessToken: string;
    }>,
  ) => {
    const { accessToken } = action.payload;
    state.accessToken = accessToken;
  },

  setRefreshToken: (
    state: WritableDraft<AuthState>,
    action: PayloadAction<{
      refreshToken: string;
    }>,
  ) => {
    const { refreshToken } = action.payload;
    state.refreshToken = refreshToken;
  },
};
