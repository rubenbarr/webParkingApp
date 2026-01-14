"use client";
import React, { useEffect, useReducer, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { requestPasswordReset, submitNewPassword, validateUrlFromChangePasswordPage } from "@/api/authApi";
import cn from "classnames";

import { Response } from "@/api/usersApi";
import LoadingComponent from "@/components/Loading";
import "../changePassword/changePassword.scss";

import Logo from "../../assets/images/logoOriginalsmartparking.png";
import Image from "next/image";

type RecoverPassword = {
  email: string | null;
  confirmEmail: string | null;
};


const initialState = {
  confirmEmail: "",
  email: "",
} as RecoverPassword;

const SET_CONFIRM_EMAIL = "SET_CONFIRM_EMAIL";
const SET_EMAIL = "SET_EMAIL";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reducer = (state: any, action: any) => {
  switch (action.type) {
    case SET_EMAIL:
      return { ...state, email: action.payload };
    case SET_CONFIRM_EMAIL:
      return { ...state, confirmEmail: action.payload }
    default:
      return state;
  }
};

export default function ChangePasswordPage() {
  const router = useRouter();
  
  const { handleToast } = useAuth();
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [secondaryLoading, setSecondaryLoading] = useState<boolean>(false)
  const [shouldDisplay, setShouldDisplay] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [globalState, dispatch] = useReducer(
    reducer,
    initialState as RecoverPassword
  );
  const [canSubmit, setCanSubmit] = useState(false);
  const [validEmail, setValidEmail] = useState<boolean>(false);

  async function requestNewPasswordReq(){
    if(!canSubmit || !validEmail ||  globalState.email === "") return;

    try {
      setSecondaryLoading(true);
      const req = await requestPasswordReset(globalState.email as string) as Response;
      if (!req.state) return handleToast('error', `Error en solicitud: ${req.message}`)

      dispatch({type: SET_CONFIRM_EMAIL, payload: ""});
      dispatch({type: SET_EMAIL, payload: ""});
      handleToast('success', req.message);
      return router.replace('/login');
    } catch (error) {
      handleToast('error', `Hubo un error solicitando recuperación de contraseña, Error ${error}`)
    } finally {
      setSecondaryLoading(false);
    }


  }
  
  useEffect(() => {
    setValidEmail(globalState.email!== "" && globalState.email === globalState.confirmEmail);
    setCanSubmit(globalState.email!== "" && globalState.email === globalState.confirmEmail);
  },[globalState])
  


  const changePasswordContent = () => {
    return (
      <>
      { secondaryLoading && <LoadingComponent light={true} />}
        <div className="page-body">
          <div className="change-password-container">
          <a onClick={() => router.push('./login')} className="forgot-password-label">Regresar a Login</a>
            <Image alt="Logo Image" src={Logo} width={200} height={100} />
            <div className="header-content">
              <h1>Recuperación de contraseña</h1>
              <label>
                Coloque su correo electronico, si el correo existe,  se le enviará una contraseña temporal y podrá actualizar la contraseña.
              </label>
            </div>
            <div className="input">
              <input
                id="email"
                type="text"
                value={globalState.email || ""}
                onChange={(e) =>
                  dispatch({
                    type: SET_EMAIL,
                    payload: e.target.value,
                  })
                }
                onKeyDown={(e:React.KeyboardEvent) => { if (e.key ==="Enter") return  requestNewPasswordReq() } }
              />
              <label
                className={cn("input-label", {
                  hasText: globalState.email,
                })}
                htmlFor="email"
              >
                Correo
              </label>
              <button
                onClick={() => dispatch({ type: SET_EMAIL, payload: "" })}
                className="erase"
              >
                X
              </button>
            </div>
            <div className="input">
              <input
                onKeyDown={(e:React.KeyboardEvent) => { if (e.key ==="Enter") return  requestNewPasswordReq() } }
                id="prev-password"
                type="text"
                value={globalState.confirmEmail || ""}
                onChange={(e) =>
                  dispatch({
                    type: SET_CONFIRM_EMAIL,
                    payload: e.target.value,
                  })
                }
              />
              <label
                className={cn("input-label", {
                  hasText: globalState.confirmEmail,
                })}
                htmlFor="prev-password"
              >
                Confirmar correo
              </label>
              <button
                onClick={() =>
                  dispatch({ type: SET_CONFIRM_EMAIL, payload: "" })
                }
                className="erase"
              >
                X
              </button>
            </div>
            <div className="password-instructions">
              <label className="header">El correo debe: </label>
              <ul className="instructions-list">
                <li
                  className={cn({
                    validating: globalState.email !== "",
                    isValid:
                      globalState.email !== "" && validEmail,
                  })}
                >
                  Coincidir
                </li>
              </ul>
            </div>
            <button onClick={requestNewPasswordReq} className={cn("primary-button", { disable: !canSubmit })}>
              Actualizar contraseña
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    changePasswordContent()
  )
}
