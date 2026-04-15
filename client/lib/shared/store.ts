import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "../features/auth/auth-api";
import {
  authListenerMiddleware,
  authReducer,
} from "../features/auth/auth-slice";
import { serviceApi } from "../features/service/service-api";
import { serviceReducer } from "../features/service/service-slice";

// Configure the Redux store
export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [authApi.reducerPath]: authApi.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
    //  [vehicleApi.reducerPath]: vehicleApi.reducer,

    auth: authReducer,
    service: serviceReducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(serviceApi.middleware)
      //  .concat(vehicleApi.middleware)
      .prepend(authListenerMiddleware.middleware),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Export the root state type and the dispatch type for use in typed hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
