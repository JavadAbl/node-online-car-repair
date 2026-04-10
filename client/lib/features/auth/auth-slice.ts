import { createListenerMiddleware, createSlice } from "@reduxjs/toolkit";
import type { AuthState } from "./auth-types";
import { authReducers } from "./auth-reducers";

const initialState: AuthState = {
  accessToken: null,
  tokenObject: null,
  isAuth: false,
  user: null,
  refreshToken: null,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: authReducers,
});

//---------------------------------------------------------------
export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;

export const authListenerMiddleware = createListenerMiddleware();

authListenerMiddleware.startListening({
  actionCreator: authActions.setTokens,
  effect: (action) => {
    localStorage.setItem("accessToken", action.payload.accessToken);
    localStorage.setItem("refreshToken", action.payload.refreshToken);
  },
});

authListenerMiddleware.startListening({
  actionCreator: authActions.logout,
  effect: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
});

authListenerMiddleware.startListening({
  actionCreator: authActions.login,
  effect: (action) => {
    localStorage.setItem("accessToken", action.payload.accessToken);
    localStorage.setItem("refreshToken", action.payload.refreshToken);
  },
});
