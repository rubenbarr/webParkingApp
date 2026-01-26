import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPersonalCreditInfoRequest } from "@/api/credits";
import { Response } from "@/api/usersApi";

export interface ICredit {
  creditUsed: number;
  current_amount: number;
  initial_amount: number;
  requestId: string;
  status: string;
}

interface IRequestCreditInfoProps {
  token: string;
  shouldRequestClosedCredit?: boolean;
}

interface ICreditInfoState {
  creditInfo: ICredit | null;
  hasCredit: boolean;
  isLoading: boolean;
  error: Error;
}
type Error = {
  state: boolean;
  message: string | null;
};
const initial: ICreditInfoState = {
  creditInfo: null,
  hasCredit: false,
  isLoading: false,
  error: {
    message: null,
    state: false,
  },
};

export const fetchCreditInfo = createAsyncThunk(
  "creditInfo/fetch",
  async (props: IRequestCreditInfoProps) => {
    const { token, shouldRequestClosedCredit } = props;
    const creditRes = (await getPersonalCreditInfoRequest(token, shouldRequestClosedCredit)) as Response;
    return creditRes;
  }
);

const CreditInfoSlice = createSlice({
  name: "creditInfo",
  initialState: initial,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreditInfo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCreditInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.state) {
          state.creditInfo = action.payload.data as ICredit;
          state.hasCredit = true;
        } else {
          state.error.state = true;
          state.error.message =
            action.payload?.message ||
            "Hubo un error obteniendo informacion de credito, intentelo nuevamente o  comuniquese con administracion";
          state.hasCredit = false;
        }
      })
      .addCase(fetchCreditInfo.rejected, (state) => {
        state.hasCredit = false;
        state.isLoading = false;
        state.error.state = true;
        state.error.message =
          "Hubo un error obteniendo informacion de credito, intentelo nuevamente o  comuniquese con administracion";
      });
  },
});

export default CreditInfoSlice.reducer;
