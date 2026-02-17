/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useAuth } from '@/context/AuthContext';
import { validateTicketReq } from '@/api/ticketsApi';
import { Response } from '@/api/usersApi';

export default function TicketValidation() {
  const {userType, token, setLoadingGlobal, isLoadingGlobal, } = useAuth();
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<Html5Qrcode>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [scanning, setIsScanning] = useState(false);
  const [shouldDisplayQrReader, setshouldDisplayQrReader] = useState(false);
  

  const stopScanner = async (eraseResult:boolean) => {
    try {
      if (eraseResult) setResult(null)
      if(scanning && qrInstance.current) {
       await qrInstance.current.stop();
        setIsScanning(false);
      }
    } catch(error) {
      console.log(error)
    }
  }

  const startScanner = async () => {
    setResult(null);
    setError(null);
    try {
      if(!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices ) {
        setError("Es posible que tu navegador no soporte tu camara, cambia de navegador a google Chrome")
        return;
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      
      if (videoDevices.length === 0) {
        setError("No se encontro camara para navegar, no es posible realizar validacion")
        return;
      }
      

      const isMobile = /Android|iPhone|IPad|Ipod/i.test(navigator.userAgent);
      let cameraId = videoDevices[0].deviceId;
      if (isMobile) {
        const backCamera = videoDevices.find(d => 
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("rear") || 
          d.label.toLowerCase().includes("environment")
        )
        if (backCamera) cameraId = backCamera.deviceId;
      }
      
      qrInstance.current = new Html5Qrcode("qr-reader")
      setIsScanning(true);
      await qrInstance.current.start(cameraId , 
        {
          fps: 10,
          qrbox: {width:250, height: 250}
        },
        async (decodedText) => {
          await stopScanner(false);
          setResult(decodedText);
        },
        (errorMessage) => {
          
        }
      )
      setshouldDisplayQrReader(true);
    } catch (error) {
      console.log(error)
      setError("Error activando tu camara, comunicate con administracion" + `${error}`)
      setshouldDisplayQrReader(false);
      
    }
  }

  const validateTicket = async () =>  {
    if (!result) return;
    try {
      setLoadingGlobal(true);
      const data = await validateTicketReq(token as string, result as string) as Response;
      if (!data.state) {
        setError(data?.message ||  "Hubo un error validando ticket, consulte a administracion")
      } else {
        setError("Se valido correctamente el ticket")
      }
    } catch(error: unknown | Response | any) {
      const errorMessage = error?.message || "Hubo un error validando ticket, consulte a administracion"
      setError(errorMessage)
    } finally {
      setLoadingGlobal(false)
    }


  }


  useEffect(() => {
    if (result) {
      stopScanner(false);
      validateTicket()
    } 
  },[result])


  useEffect(() => {
    navigator.mediaDevices.getUserMedia( {video: true})
  },[])

  const qrReader = () => {
    return (
      !error && 
      <div id={'qr-reader'} ref={qrRef} style={{width: "300px"}}>
      </div>
    )
  }
  const ErrorLabel = () => {
    if(error) {
      return (
        <div>
        <label>{error}</label>
        </div>
      )
    }
  }

  return (
    <div className='main-content'>
        <h2 className='main-header'>Validacion de ticket</h2>
      {!scanning ? 
      <button className='primary-button' onClick={startScanner}>Validar Ticket</button> : 
      <button className='primary-button' onClick={() => stopScanner(true)}>Cancelar</button> }
      {ErrorLabel()}
      {qrReader()}
      {/* {result && ( <label>{result}</label>)} */}
    </div>
  )
}
