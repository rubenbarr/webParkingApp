'use client'
import { useRouter } from "next/navigation";


export default function NotFound() {
    const router = useRouter();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap:"10px",
        backgroundColor:"#ffff"
      }}
    >
      <h1 style={{ fontSize: "3rem" }}>Ops!</h1>
      <p>Esta pagina no existe</p>
      <button onClick={() => router.back()} className="primary-button">Regresar</button>
    </div>
  );
}