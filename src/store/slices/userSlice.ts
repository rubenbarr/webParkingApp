import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/user";

interface UsersState {
  list: User[];
}

const initialState: UsersState = {
  list: [],
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.list = action.payload;
    },
  },
});

export const { setUsers } = userSlice.actions;
export default userSlice.reducer;