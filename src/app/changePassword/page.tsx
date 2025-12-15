"use client";
import React, { useEffect, useReducer, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { submitNewPassword, validateUrlFromChangePasswordPage } from "@/api/authApi";
import cn from "classnames";

import { Response } from "@/api/usersApi";
import LoadingComponent from "@/components/Loading";
import "./changePassword.scss";

import Logo from "../../assets/images/logoOriginalsmartparking.png";
import Image from "next/image";

type ChangePassword = {
  temporalPassword: string | null;
  newPassword: string | null;
  confirmPassword: string | null;
  email: string;
};

type CorrectPassword = {
  properLength: boolean;
  match: boolean;
  specialChar: boolean;
};

const initialState = {
  temporalPassword: "",
  newPassword: "",
  confirmPassword: "",
  email: "",
} as ChangePassword;

const SET_PREVIOUS_PASSWORD = "SET_PREVIOUS_PASSWORD";
const SET_CONFIRM_PASSWORD = "SET_CONFIRM_PASSWORD";
const SET_NEW_PASSWORD = "SET_NEW_PASSWORD";
const SET_EMAIL = "SET_EMAIL";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reducer = (state: any, action: any) => {
  switch (action.type) {
    case SET_PREVIOUS_PASSWORD:
      return { ...state, temporalPassword: action.payload };
    case SET_NEW_PASSWORD:
      return { ...state, newPassword: action.payload };
    case SET_CONFIRM_PASSWORD:
      return { ...state, confirmPassword: action.payload };
    case SET_EMAIL:
      return { ...state, email: action.payload };
    default:
      return state;
  }
};

export default function ChangePasswordPage() {
  const specialChars = `!@"#$%&/()=?¡`;
  const router = useRouter();
  const params = useSearchParams();
  const { handleToast } = useAuth();
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsloading] = useState(false);
  const [secondaryLoading, setSecondaryLoading] = useState<boolean>(false)
  const [shouldDisplay, setShouldDisplay] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [globalState, dispatch] = useReducer(
    reducer,
    initialState as ChangePassword
  );
  const [canSubmit, setCanSubmit] = useState(false);
  const [validPassword, setValidPassword] = useState<CorrectPassword>({
    properLength: false,
    match: false,
    specialChar: false,
  });

  useEffect(() => {
    setIsloading(true);
    const tempTokenP = params.get("tempToken");
    const userIdP = params.get("requestId");

    if (!tempTokenP || !userIdP) {
      setIsloading(false);
      return router.replace("/login");
    }

    setTempToken(tempTokenP);
    setUserId(userIdP);

    async function validatePageSession() {
      setIsloading(true);
      try {
        const req = (await validateUrlFromChangePasswordPage(
          tempTokenP as string,
          userIdP as string
        )) as Response;
        if (!req?.state) {
          handleToast("error", req.message);
          return router.replace("/login");
        }
        setShouldDisplay(true);
      } catch (error: unknown) {
        handleToast("error", "Hubo un error, intente más tarde");
        return router.replace("/login");
      } finally {
        setIsloading(false);
      }
    }
    validatePageSession();
  }, []);

  async function submitNewPasswordReq() {
    try {
      setSecondaryLoading(true);
      const req = await submitNewPassword(tempToken as string, userId as string, {
        email: globalState.email,
        temporalPassword: globalState.temporalPassword,
        newPassword: globalState.newPassword
      }) as Response;
      if(req.state) {
        handleToast('success', 'Actualización de correo correcto, inicie sesión');
        return  router.replace("./login");
      } else {
        handleToast('error', req.message);
      }

    } catch (error) {
      console.log(error);
      handleToast('error', 'Hubo un error actualizando contraseña, intente más tarde o comuniquese con administración');
    } finally {
      setSecondaryLoading(false);
    }
  }

  const checkIfCanSubmit = () => {
    return Object.values(globalState).every((i) => i !== "");
  };

  const checkNewPassword = () => {
    const validLength = globalState.newPassword.split("").length >= 8;
    const passwordMatch =
      globalState.confirmPassword === globalState.newPassword;
    const hasSpecialChar = globalState.newPassword
      .split("")
      .some((i: string) => specialChars.split("").includes(i));
    setValidPassword({
      properLength: validLength,
      match: passwordMatch,
      specialChar: hasSpecialChar,
    });
    return validLength && hasSpecialChar && passwordMatch;
  };

  useEffect(() => {
    const validSubmit = checkIfCanSubmit();
    const hasValidNewPassword = checkNewPassword();
    setCanSubmit(validSubmit && hasValidNewPassword);
  }, [globalState]);

  const ChangePasswordContent = () => {
    return (
      <>
      { secondaryLoading && <LoadingComponent light={true} />}
        <div className="page-body">
          <div className="change-password-container">
            <Image alt="Logo Image" src={Logo} width={200} height={100} />
            <div className="header-content">
              <h1>Actualización de Contraseña</h1>
              <label>
                Utilice su contraseña temporal y escoga una contraseña nueva.
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
                id="prev-password"
                type="text"
                value={globalState.temporalPassword || ""}
                onChange={(e) =>
                  dispatch({
                    type: SET_PREVIOUS_PASSWORD,
                    payload: e.target.value,
                  })
                }
              />
              <label
                className={cn("input-label", {
                  hasText: globalState.temporalPassword,
                })}
                htmlFor="prev-password"
              >
                Contraseña temporal
              </label>
              <button
                onClick={() =>
                  dispatch({ type: SET_PREVIOUS_PASSWORD, payload: "" })
                }
                className="erase"
              >
                X
              </button>
            </div>
            <div className="input">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={globalState.newPassword || ""}
                onChange={(e) =>
                  dispatch({
                    type: "SET_NEW_PASSWORD",
                    payload: e.target.value,
                  })
                }
              />
              <label
                className={cn("input-label", {
                  hasText: globalState.newPassword,
                })}
                htmlFor="new-password"
              >
                Nueva Contraseña
              </label>
              <button
                onClick={() =>
                  dispatch({ type: SET_NEW_PASSWORD, payload: "" })
                }
                className="erase"
              >
                X
              </button>
            </div>
            <div className="input">
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={globalState.confirmPassword || ""}
                onChange={(e) =>
                  dispatch({
                    type: SET_CONFIRM_PASSWORD,
                    payload: e.target.value,
                  })
                }
              />
              <label
                className={cn("input-label", {
                  hasText: globalState.confirmPassword,
                })}
                htmlFor="confirm-password"
              >
                Confirmar Contraseña
              </label>
              <button
                onClick={() =>
                  dispatch({ type: SET_CONFIRM_PASSWORD, payload: "" })
                }
                className="erase"
              >
                X
              </button>
            </div>
            <button
              className="show-password-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}
            </button>
            <div className="password-instructions">
              <label className="header">La nueva contraseña debe: </label>
              <ul className="instructions-list">
                <li
                  className={cn({
                    validating: globalState.newPassword !== "",
                    isValid: validPassword.properLength,
                  })}
                >
                  Tener al menos 8 caracteres
                </li>
                <li
                  className={cn({
                    validating: globalState.newPassword !== "",
                    isValid:
                      globalState.newPassword !== "" && validPassword.match,
                  })}
                >
                  Coincidir
                </li>
                <li
                  className={cn({
                    validating: globalState.newPassword !== "",
                    isValid:
                      globalState.newPassword !== "" &&
                      validPassword.specialChar,
                  })}
                >
                  Tener un caracter especial <b>(!&quot;&quot;#$%&/())</b>{" "}
                </li>
              </ul>
            </div>
            <button onClick={submitNewPasswordReq} className={cn("primary-button", { disable: !canSubmit })}>
              Actualizar contraseña
            </button>
          </div>
        </div>
      </>
    );
  };

  return isLoading ? (
    <LoadingComponent light={true} />
  ) : shouldDisplay ? (
    ChangePasswordContent()
  ) : null;
}
