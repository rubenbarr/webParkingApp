import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getTotalLocations } from "@/api/globals";
import { Response } from "@/api/usersApi";

type Data = {
  _id: string;
  total: string;
};

type DashboardState = {
  locations: Data | null;
  loading: boolean;
  error: string | null;
};

const initialState: DashboardState = {
  locations: null,
  loading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetch",
  async (token: string) => {
    const [locRes] = await Promise.all([getTotalLocations(token)]);

    const locR = locRes as Response;
    const locData = locR.data as string[];

    return {
      locations: locData[0] as unknown as Data,
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
      })
      .addCase(fetchDashboardData.rejected, (state) => {
        state.loading = false;
        state.error = "Error Loading Dashboard Data";
      });
  },
});

export default dashboardSlice.reducer;
