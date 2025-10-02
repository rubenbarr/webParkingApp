"use client";

import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import EyeIcon from "@/assets/icons/Eye";
import EyeClosed from "@/assets/icons/EyeClosed";
import LoadingIcon from "@/assets/icons/LoadingIcon";
import { loginService, validateAuthenticatorCode } from "@/api/authApi";
import { toast, ToastContainer } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/context/AuthContext";


import "./styles/pagestyles.css";

type TokenType = {
  token: string;
  user: string;
  qrCode: string
}

interface LoginReq {
  data: TokenType;
  state: boolean;
  message: string;
}

export default function LoginPage() {

  const { login, setIslogged } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();
  const [invalidSubmit, setInvalidSubmit] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authCode, setAuthCode] = useState<string>("");
  const [seePassword, setSeePassword] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const [qrcode, setQrCode] = useState<string | null>(null);
  const [containerAnimation, setContainerAnimation] = useState<string>("");
  const [inputContainerAnimation, setInputContainerAnimation] =
    useState("inputContainer");
  const [qrContainerInPlace, setQrContainerInPlace] = useState<boolean>(true);
  const [canSubmitAuthenticatorCode, setCanSubmitAuthenticatorCode] =
    useState<boolean>(false);
  const [authenticatorContainerVisible, setAuthenticatorContainerVisible] =
    useState<boolean>(false);

  const [removeLoginContainer, setRemoveLoginContainer] = useState("");
  const [loginInPlace, setLoginInPlace] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState(30);
  const [initTimer, setInitTimer] = useState(false);

  useEffect(() => {
    if (initTimer) {
      if (timeLeft === 0) {
        resetToLogin();
      }
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [initTimer, timeLeft]);


  const validatecode = async () => {
    try {
      setIsloading(true);
      const req = await validateAuthenticatorCode(email, authCode) as LoginReq;
      if (!req.state) {
         toast.error(req.message, { closeButton: true, autoClose: 4000 });
      } else {
        if(req.data.token) {
            toast.success("Bienvenido", {
            isLoading: false,
            closeButton: true,
            autoClose: 4000,
          });
          login(req.data.user, req.data.token)
          setIslogged(true);
          router.replace("/dashboard")
        }
      }
    } catch (error) {
      toast.error('hubo un error, intente nuevamente o más tarde', { closeButton: true, autoClose: 4000 });
    } finally {
      setIsloading(false)
    }
  }

  const handleLogin = async () => {
    try {
      
      setIsloading(true);
      const req = (await loginService(email, password)) as LoginReq;
      if (req) {
        setIsloading(false);
        if (!req.state) {
          toast.error(req.message, { closeButton: true, autoClose: 4000 });
        } else {
          setInvalidSubmit(false);
          toast.success("Login correcto", {
            isLoading: false,
            closeButton: true,
            autoClose: 4000,
          });
          if (req.message === "isGlobal") {
            login( req.data.user, req.data.token)
            router.replace("/dashboard");
          } else if (req.message == "") {
            setIsAuthenticated(false);
            handleLoginAnimation(req.data.qrCode, false);
            setInitTimer(true);
          } else if (req.message === "authenticated") {
            setIsAuthenticated(true);
            handleLoginAnimation(req.data.qrCode, true);
          }
        }
      }
    } catch (error) {
      toast.error(`Hubo un error intente más tarde ${error}`, {
        isLoading: false,
        closeButton: true,
        autoClose: 4000,
      });
    } finally {
      setIsloading(false);
    }
  };

  const validEmail = () => {
    const emailRegex = new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
    return emailRegex.test(email);
  };

  const validPassword = () => {
    return password.length >= 4;
  };

  const canSubtmit = () => {
    const isValid = validEmail() && validPassword();
    setInvalidSubmit(isValid);
  };

  useEffect(() => {
    canSubtmit();
  }, [email, password]);

  const shownextAnimation = () => {
    const classes = inputContainerAnimation
      .split(" ")
      .filter((c) => c !== "remove");
    setInputContainerAnimation(classes.toString());
    setTimeout(() => {
      setInputContainerAnimation((prev) => prev.concat(" inPlace"));
    }, 500);
  };

  const goToVaildateAuthenticatorCode = () => {
    setInitTimer(false);
    setAuthenticatorContainerVisible(true);
    setContainerAnimation("containerAnimation");
    setTimeout(() => {
      setContainerAnimation((prev) => prev.concat(" remove"));
      setQrContainerInPlace(false);
      shownextAnimation();
    }, 500);
  };

  const handleLoginAnimation = (
    qr: string,
    isAuthenticated: boolean = false
  ) => {
    setRemoveLoginContainer("removeLoginContainer");
    const hide = " hide";
    const inPlace = " inPlace";
    setTimeout(() => {
      setRemoveLoginContainer((prev) => prev.concat(hide));
    }, 500);
    setTimeout(() => {
      setLoginInPlace(false);
      if (isAuthenticated) {
        goToVaildateAuthenticatorCode();
      } else {
        setQrContainerInPlace(true);
        setQrCode(qr);
        setContainerAnimation("inputContainer");
      }
    }, 600);
    if (!isAuthenticated) {
      setTimeout(() => {
        setContainerAnimation((prev) => prev.concat(inPlace));
      }, 800);
    }
  };

  const resetToLogin = () => {
    setInitTimer(false);
    setTimeLeft(30);
    setContainerAnimation("inputContainer");
    setTimeout(() => {
      setQrContainerInPlace(false);
      setLoginInPlace(true);
      setRemoveLoginContainer("removeLoginContainer");
    }, 500);
    setTimeout(() => {
      setInvalidSubmit(true);
      setRemoveLoginContainer("inPlace");
    }, 1000);
  };

  const invalidOutput = (type: string) => {
    switch (type) {
      case "email":
        if (email.length === 0 || email.length < 5)
          return "focus:outline-gray-600";
        else
          return !validEmail()
            ? "focus:outline-red-500"
            : "focus:outline-green-600";
      case "password":
        return validPassword()
          ? "focus:outline-green-600"
          : "focus:outline-red-500";
      default:
        break;
    }
  };

  const loadingComponent = () => {
    return (
      <div className='loading-container z-10'>
        <div className="loading-icon">
          <LoadingIcon width="100%" height="100%" />
        </div>
      </div>
    );
  };

  const regresarQr = () => {
    if (!isAuthenticated){
      setInitTimer(true);
    }
    const inputClasess = inputContainerAnimation.trim().split(" ");
    const newClases = inputClasess.filter((i) => i !== "inPlace");
    setInputContainerAnimation(newClases.toString());
    setTimeout(() => {
      setInputContainerAnimation((prev) => prev.concat(" remove"));
      if (isAuthenticated) {
        setLoginInPlace(true);
        setInvalidSubmit(true);
        setRemoveLoginContainer("removeLoginContainer");
        setTimeout(() => {
          setInvalidSubmit(true);
          setRemoveLoginContainer("inPlace");
        }, 400);
      } else {
        setQrContainerInPlace(true);
        setTimeout(() => {
          setContainerAnimation((prev) => prev.concat(" inPlace"));
        }, 100);
      }
    }, 500);
  };

  const handlePress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      if (invalidSubmit && !isLoading) {
        handleLogin();
      }
    }
  };

  const codeAndQrcontainerValidation = () => {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-800">
        {qrcode && (
          <div
            className={`${containerAnimation} p-8 bg-white shadow rounded w-100`}
          >
            <button
              onClick={resetToLogin}
              className="text-blue-600 visited:text-purple-600 cursor-pointer"
            >
              Regresar
            </button>
            <h1 className="font-semibold mb-4 text-center">
              Scanea el codigo con tu app de Autenticador
            </h1>
            <div className="mb-10 flex justify-center w-full h-full">
              {qrcode && <QRCodeSVG value={qrcode} size={300} />}
            </div>
            {initTimer && (
              <>
                <h2 className="font-normal mb-1 text-center">
                  tiempo restante
                </h2>
                <p className="font-bold mb-1 text-center">{`${timeLeft} seg`}</p>
              </>
            )}
            <button
              className="w-full bg-blue-500 text-white py-2 rounded  hover:bg-gray-600 enabled:cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-600"
              onClick={goToVaildateAuthenticatorCode}
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    );
  };

  const authenticatorInputCodeContainer = () => {
    return (
      <div
        className={`${inputContainerAnimation} p-8 bg-white shadow rounded w-100`}
      >
        <button
          onClick={regresarQr}
          className="text-blue-600 visited:text-purple-600 cursor-pointer mb-10"
        >
          {isAuthenticated ? "Regresar a login" :"Regresar a QR"}
        </button>
        <h1 className="font-semibold mb-4 text-center">
          Codigo de Autenticador
        </h1>
        <div className="mt-2 mb-4">
          <input
            type="text"
            id="about"
            name="about"
            className={` block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6`}
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            autoComplete="off"
          />
        </div>
        <button
          className="w-full bg-blue-500 text-white py-2 rounded  hover:bg-gray-600 enabled:cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-600"
          onClick={validatecode}
          disabled={canSubmitAuthenticatorCode}
        >
          Validar Codigo
        </button>
      </div>
    );
  };


  return (
    <div className="flex h-screen items-center justify-center bg-gray-800 p-5">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {qrContainerInPlace && codeAndQrcontainerValidation()}
      {authenticatorContainerVisible && authenticatorInputCodeContainer()}
      {isLoading && loadingComponent()}
      {loginInPlace && (
        <div
          className={`p-8 bg-white shadow rounded w-96 ${removeLoginContainer}`}
        >
          <h2 className="text-gray-900 font-semibold">
            Login para usuarios
          </h2>
          <div className="col-span-full">
            <label className="block text-sm/6 font-medium text-gray-900 font-semibold">
              Correo
            </label>
            <div className="mt-2 mb-4">
              <input
                onKeyDown={(e) => handlePress(e)}
                id="about"
                name="about"
                className={` block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6  ${invalidOutput(
                  "email"
                )}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="col-span-full">
            <label className="block text-sm/6 font-medium text-gray-900 font-semibold">
              password
            </label>
            <div className=" relative mt-2 mb-4">
              <input
                onKeyDown={(e) => handlePress(e)}
                id="about"
                name="about"
                type={seePassword ? "text" : "password"}
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-700 sm:text-sm/6 ${invalidOutput(
                  "password"
                )}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setSeePassword(!seePassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                tabIndex={-1}
                aria-label={seePassword ? "Hide password" : "Show password"}
              >
                {seePassword ? (
                  <EyeClosed width={"30px"} height={"30px"} />
                ) : (
                  <EyeIcon width={"30px"} height={"30px"} />
                )}
              </button>
            </div>
          </div>
          <button
            className="w-full bg-blue-500 text-white py-2 rounded  hover:bg-gray-600 enabled:cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-600"
            onClick={handleLogin}
            disabled={!invalidSubmit || isLoading}
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}
