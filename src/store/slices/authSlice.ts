import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
}


const initialState: AuthState = {
    isAuthenticated:false, 
    token:null,
};

const AuthSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        loginSuccess: (state, action: PayloadAction<string>) => {
         state.isAuthenticated = true;
         state.token = action.payload;   
        },
        logOut:(state) => {
            state.isAuthenticated = false;
            state.token = null;
        }
    }
})

export const { loginSuccess, logOut } = AuthSlice.actions;
export default AuthSlice.reducer;
