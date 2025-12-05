import { getLocationById } from "@/api/locationApi";
import { Response } from "@/api/usersApi";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";







type Data = {
    id: string;
    name: string
}
type Params = {
    token:string;
    locationId: string;
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
            const data = action.payload.locationData as LocationState;
            state.locationData = data;
        })
        .addCase(fetchLocationInfo.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error;
        })
    }
})

export default locationInfoSlice.reducer;