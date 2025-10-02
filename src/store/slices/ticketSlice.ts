import { Ticket } from "@/types/ticket";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TicketState {
    list : Ticket[];
}

const initialState: TicketState = {
    list:[],
};

const ticketSlice = createSlice({
    name :'tickets',
    initialState,
    reducers:{
        setTickets: (state, action: PayloadAction<Ticket[]> ) => {
            state.list = action.payload;
        }
    }
})


export const { setTickets } = ticketSlice.actions;
export default ticketSlice.reducer;