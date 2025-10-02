import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import ticketReducer from './slices/ticketSlice';


export const store = configureStore({
    reducer:{
        auth: authReducer,
        user: userReducer,
        tickets: ticketReducer
    }
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;