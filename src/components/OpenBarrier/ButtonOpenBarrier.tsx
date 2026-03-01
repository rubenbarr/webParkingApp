/* eslint-disable @typescript-eslint/no-explicit-any */

import { useAuth } from "@/context/AuthContext";
import React, { useRef, useState } from "react";

interface IButtonBarrierProps {
  ShouldDisplay: boolean;
  handleShouldDisplay: (state:any) => void
}

export default function ButtonOpenBarrier(props: IButtonBarrierProps) {
  const { ShouldDisplay, handleShouldDisplay } = props;
  const { handleToast } = useAuth();
  const wsRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, hasError] = useState(null);

  const openBarrier = () => {
    if (loading) return;
    setLoading(true);

    const token =
      "48e152152225498d99a1d56fd1a16dc202a3caef4155f113f7e2d7e86458118a";
    const ws = new WebSocket(
      `wss://macroscopic-oppugnant-audriana.ngrok-free.dev/ws?token=${token}`,
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Conectado");
      ws.send("OPEN");
    };

    ws.onmessage = (event) => {
      console.log("Respuesta: " + event.data);
      ws.close();
    };
    ws.onerror = (err) => {
      console.log("Error websocket: ", err);
      setLoading(false);

    };

    ws.onclose = () => {
      console.log("conexion terminada");
      setLoading(false);
    };
  };

  return (
    ShouldDisplay && (
      <button
        className="primary-button"
        onClick={openBarrier}
        disabled={loading}
      >
        Abrir Barrera
      </button>
    )
  );
}
