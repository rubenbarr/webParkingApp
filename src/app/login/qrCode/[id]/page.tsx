"use client";

import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";
import { useRouter, useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

import "./style.css";

type AutehticationProps = {
  shouldDisplay: boolean;
}

export default function QrCodePage(props: AutehticationProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();

  const [qrcode, setQrCode] = useState<string | null>(null);
  const [containerAnimation, setContainerAnimation] = useState<string>("");
  const [inputContainerAnimation, setInputContainerAnimation] = useState("inputContainer");
  const [qrContainerInPlace, setQrContainerInPlace] = useState<boolean>(true);
  const [authCode, setAuthCode] = useState<string>("");
  const [inputCodeDisable, setInputCodeDisable ] = useState<boolean>(true);

  const placeInputs = () => {
    setContainerAnimation("containerAnimation");
    setTimeout(() => {
      setContainerAnimation((prev) => prev.concat(" remove"));
      setQrContainerInPlace(false);
      shownextAnimation();
    }, 500);
    console.log(inputContainerAnimation)
  };
  useEffect(() => {
    const { id } = params as { id?: string };
    if (id) {
      setQrCode(id);
    }
  }, [params]);

  useEffect(() => {
    if(authCode.length > 5 ) setInputCodeDisable(false);
    else setInputCodeDisable(true);
  },[authCode])

  const shownextAnimation = () => {
    const classes = inputContainerAnimation.split(" ").filter(c => c !== 'remove')
    setInputContainerAnimation(classes.toString());
    setTimeout(() => {
      setInputContainerAnimation(prev => prev.concat(" inPlace"));
    }, 500);
  };

  const regresarQr = () => {
    const inputClasess = inputContainerAnimation.trim().split(" ");
    const newClases = inputClasess.filter((i) => i !== "inPlace");
    setInputContainerAnimation(newClases.toString());
    setTimeout(() => {
      setInputContainerAnimation((prev) => prev.concat(" remove"));
        setQrContainerInPlace(true);
        setTimeout(() => {
          setContainerAnimation((prev) => prev.concat(" inPlace"));
        }, 100);
    }, 500);
  };

  const qrcodeContainer = () => {
    return qrContainerInPlace && qrcode && (
        <div
          className={`${containerAnimation} p-8 bg-white shadow rounded w-100`}
        >
          <button
            onClick={() => router.push("/login")}
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
          <button
            className="w-full bg-blue-500 text-white py-2 rounded  hover:bg-gray-600 enabled:cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-600"
            onClick={placeInputs}
          >
            Continuar
          </button>
        </div>
      )}

  const codeValidationContent = () => {
    return !qrContainerInPlace && (
        <div
          className={`${inputContainerAnimation} p-8 bg-white shadow rounded w-100`}
        >
          <button
            onClick={regresarQr}
            className="text-blue-600 visited:text-purple-600 cursor-pointer mb-10"
          >
            regresar a QR
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
            onClick={placeInputs}
            disabled={inputCodeDisable}
          >
            Validar Codigo
          </button>
        </div>
      )
  }
  
  return (
    props.shouldDisplay && (      
      <div className="flex h-screen items-center justify-center bg-gray-800">
      </div>
      )
  );
}