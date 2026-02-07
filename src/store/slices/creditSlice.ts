import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPersonalCreditInfoRequest, getUserCredits } from "@/api/credits";
import { Response } from "@/api/usersApi";
import { ICredit } from "@/types/credits";

interface ICreditInfoState {
  creditInfo: ICredit | null;
  hasCredit: boolean;
  isLoading: boolean;
  error: Error;
  userCredits: ICredit[]
  hasFetched: boolean;
}

interface IRequestCreditInfoProps {
  token: string;
  shouldRequestClosedCredit?: boolean;
  userId?:string;
  page?: number;
  limit?:number;
}


type Error = {
  state: boolean;
  message: string | null;
};
const initial: ICreditInfoState = {
  userCredits: [],
  creditInfo: null,
  hasCredit: false,
  isLoading: false,
  hasFetched:false,
  error: {
    message: null,
    state: false,
  },
};

export const fetchCreditInfo = createAsyncThunk(
  "creditInfo/fetch",
  async (props: IRequestCreditInfoProps) => {
    const { token, shouldRequestClosedCredit } = props;
    const creditRes = (await getPersonalCreditInfoRequest(
      token,
      shouldRequestClosedCredit
    )) as Response;
    return creditRes;
  }
);

export const fetchUserCredits = createAsyncThunk(
  'userCredits/fetch',
  async(props: IRequestCreditInfoProps) => {
    const {token, page, limit} = props;
    const creditsRes = (await getUserCredits(token, page as number, limit as number)) as Response
    return creditsRes;
  }
)

const CreditInfoSlice = createSlice({
  name: "creditInfo",
  initialState: initial,
  reducers: {},
  extraReducers: (builder) => {
    builder
    // fetch last credit ///////
    .addCase(fetchCreditInfo.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(fetchCreditInfo.fulfilled, (state, action) => {
      if (action.payload.state) {
        state.creditInfo = action.payload.data as ICredit;
        if (state.creditInfo.status === "activo" || state.creditInfo.status === "disponible" ) {
          state.hasCredit = true;
        } else {
          state.hasCredit = false;
        }
      } else {
        state.error.state = true;
        state.error.message =
        action.payload?.message ||
        "Hubo un error obteniendo informacion de credito, intentelo nuevamente o  comuniquese con administracion";
        state.hasCredit = false;
      }
      state.isLoading = false;
      state.hasFetched = true;
    })
    .addCase(fetchCreditInfo.rejected, (state) => {
      state.hasCredit = false;
      state.isLoading = false;
      state.error.state = true;
      state.hasFetched = true;
      state.error.message =
      "Hubo un error obteniendo informacion de credito, intentelo nuevamente o  comuniquese con administracion";
    })
    // fetch user  credits ///////
    .addCase(fetchUserCredits.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(fetchUserCredits.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.state) {
        state.userCredits = action.payload.data as ICredit[];
      } else {
        state.error.state = true;
        state.error.message =
        action.payload?.message ||
        "Hubo un error obteniendo informacion de sus credito, intentelo nuevamente o  comuniquese con administracion";
        state.hasCredit = false;
      }
    })
    .addCase(fetchUserCredits.rejected, (state) => {
      state.hasCredit = false;
      state.isLoading = false;
      state.error.state = true;
      state.error.message =
      "Hubo un error obteniendo informacion de sus creditos, intentelo nuevamente o  comuniquese con administracion";
    });
  },
});

export default CreditInfoSlice.reducer;
