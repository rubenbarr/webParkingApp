import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getTotalKiosk, getTotalLocations, getTotalOperators, getTotalUsers } from "@/api/globals";
import { Response } from "@/api/usersApi";

type Data = {
  _id: string;
  total: string;
};

type DashboardState = {
  locations: Data | null;
  kiosk: Data | null;
  users: Data | null;
  operators: Data | null;
  loading: boolean;
  error: string | null;
};

const initialState: DashboardState = {
  locations: null,
  kiosk: null,
  users: null,
  operators: null,
  loading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetch",
  async (token: string) => {
    const [locRes, kioskReq, userReq, operatorsReq] = await Promise.all([getTotalLocations(token), getTotalKiosk(token), getTotalUsers(token), getTotalOperators(token)]);

    const locR = locRes as Response;
    const locData = locR.data as string[];
    
    const kRes = kioskReq as Response;
    const kData = kRes.data as string[];

    const uRes = userReq as Response;
    const uData = uRes.data as string[];

    const opRes = operatorsReq as Response;
    const opData= opRes.data as string[];

    return {
      locations: locData[0] as unknown as Data,
      kiosk: kData[0] as unknown as Data,
      users: uData[0] as unknown as Data,
      operators: opData[0] as unknown as Data,
    };
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload.locations;
        state.kiosk = action.payload.kiosk;
        state.users = action.payload.users;
        state.operators = action.payload.locations;
      })
      .addCase(fetchDashboardData.rejected, (state) => {
        state.loading = false;
        state.error = "Error Loading Dashboard Data";
      });
  },
});

export default dashboardSlice.reducer;
