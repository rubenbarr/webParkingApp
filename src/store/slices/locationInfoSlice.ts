import { getLocationById } from "@/api/locationApi";
import { getFinancialData, getTicketsFromLocation } from "@/api/ticketsApi";
import { Response } from "@/api/usersApi";
import { ITicket } from "@/types/ticket";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


type Data = {
    id: string;
    name: string
}
type Params = {
    token:string;
    locationId: string;
}

type LocationDataType = {
   "_id": number;
        "totalCarsIn": number;
        "totalOut": number;
        "totalPaid": number;
        "totalPayed": number;
        "totalTickets": number;
}

export interface LocationInfo {
    loading: boolean;
    data: LocationDataType | null;
    error: boolean | null;
    errorMessage: string | null;
}

type LocationState = {
    loading: boolean;
    error: unknown;
    locationData: {
    address: string | null;
    contact: string | null;
    createdAt: string | null;
    createdBy: string | null;
    kioscos: Data[] | null;
    locationId: string | null;
    operators: Data[] | null;
    title: string | null;
    totalKiosks: number | null;
    updatedAt: string | null;
    updatedBy: string | null;
    }
}

interface ITicketsInitialState {
    loading: boolean;
    error: boolean | null;
    tickets: ITicket[];
    errorMessage: string | null;
    canLoadMore: boolean;
}


export interface ITicketsParams {
    token: string;
    locationId: string;
    page:number;
    limit:number;
    fromDate:string,
    toDate:string
}

const initialState: LocationState = {
    loading: false,
    error: false,
    locationData: {
            address: null,
            contact: null,
            createdAt: null,
            createdBy: null,
            kioscos: null,
            locationId: null,
            operators:  null,
            title: null,
            totalKiosks: null,
            updatedAt: null,
            updatedBy: null,
    }
}

const initialStateLocationInformation: LocationInfo = {
    loading: false,
    data:  null,
    error:  null,
    errorMessage: null,
}

const initialTicketsState: ITicketsInitialState  = {
    loading: false,
    error: null,
    tickets: [],
    errorMessage: null,
    canLoadMore: false,
}


export const fetchLocationInfo = createAsyncThunk(
    'locationInfo/fetch',
    async(params:Params) => {
        const { token, locationId } = params;
        const request = await getLocationById(token, locationId) as Response;
        return {
            locationData: request.data
        }
    }
)

export const fetchTickets = createAsyncThunk(
    'locationTickets/fetch',
    async(params: ITicketsParams) => {
        const { token, locationId, page, limit, fromDate, toDate  } = params;
        const req = await getTicketsFromLocation(token, locationId, page, limit, fromDate, toDate) as Response;
        return { req, page };
    }
)


export const fetchLocationFinancialData = createAsyncThunk(
    'locationsFinancialData',
    async(params: ITicketsParams) => {
        const { token, locationId, fromDate, toDate  } = params;
        const req = await getFinancialData(token, locationId, fromDate, toDate) as Response;
        return req;
    }
)


const locationInfoSlice = createSlice({
    name: 'locationInfo',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchLocationInfo.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchLocationInfo.fulfilled, (state, action) => {
            state.loading = false
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = action.payload.locationData as any;
            state.locationData = data;
        })
        .addCase(fetchLocationInfo.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error;
        })
    }
})


const ticketsSlice = createSlice({
    name: 'locationTickets',
    initialState: initialTicketsState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchTickets.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchTickets.fulfilled, (state, action) => {
            state.loading= false;
            const res = action.payload.req as Response;
            const page = action.payload.page as number;
            if (!res.state) {
                state.error = true
                state.errorMessage = res?.message || "Error desconocido obteniendo tickets"
            } else {
                const tickets = res.data as ITicket[]
                if (tickets.length === 0) {
                    state.canLoadMore = false;
                    if(page ===1) {    
                        state.tickets = []
                    }
                } 
                else {
                    state.canLoadMore = true;
                    if(state.tickets && state.tickets.length > 0 && page > 1) {
                        state.tickets = [...state.tickets, ...tickets]
                    } else {
                        state.tickets = tickets
                    }
                }
            }

        })
        .addCase(fetchTickets.rejected, (state, action) => {
            state.loading = false;
            state.error = true;
            state.errorMessage = action.error.message || "Error obteniendo tickets, desconocido"
        })
    }
})


const  financialDataSlice = createSlice({
    name: "financialData",
    initialState: initialStateLocationInformation,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchLocationFinancialData.pending, (state, action) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchLocationFinancialData.fulfilled,  (state, action) => {
            state.loading = false;
            const res = action.payload;
            if(!res.state) {
                state.error = true;
                state.errorMessage = res.message || "Error desconocido obteniendo datos financieros";
            } else {
                state.error = null;
                state.errorMessage = null;
                const data = res.data as LocationDataType;
                state.data = data
            }
        })
        .addCase(fetchLocationFinancialData.rejected, (state, action) => {
            state.error = true;
            state.errorMessage = action.error.message || "Error desconocido obteniendo datos financieros";
        })
    }

})

const ticketReducer = ticketsSlice.reducer;
const locationInfoReducer = locationInfoSlice.reducer;
const financialDataReducer = financialDataSlice.reducer;

export  { locationInfoReducer, ticketReducer, financialDataReducer };