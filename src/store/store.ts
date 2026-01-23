import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import ticketReducer from './slices/ticketSlice';
import dashboardReducer from './slices/dashboardSlice';
import locationInfoReducer from './slices/locationInfoSlice';
import creditInfoReducer from './slices/creditSlice';

export const store = configureStore({
    reducer:{
        auth: authReducer,
        user: userReducer,
        tickets: ticketReducer,
        dashboard: dashboardReducer,
        locationInfo: locationInfoReducer,
        creditInfo: creditInfoReducer
    }
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;