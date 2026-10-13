import { createListenerMiddleware, createSlice } from "@reduxjs/toolkit";
import type { ServiceState } from "./service-types";
import { serviceReducers } from "./service-reducers";

const initialState: ServiceState = {};

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: serviceReducers,
});

//---------------------------------------------------------------
export const serviceActions = serviceSlice.actions;
export const serviceReducer = serviceSlice.reducer;

export const serviceListenerMiddleware = createListenerMiddleware();
