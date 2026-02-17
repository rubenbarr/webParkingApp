"use client";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { RootState, AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import style from "./dashboardStyle.module.scss";
import CreditInfoComponent from "@/components/CreditInfo/CreditInfo";
import { fetchDashboardData } from "@/store/slices/dashboardSlice";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>()
  const { token, setLoadingGlobal, userType } = useAuth();
  const { locations, kiosk, users, operators } = useSelector( (state: RootState) => state.dashboard); 

  const renderDashboard = () => {
    switch (userType) {
      case "operador":
        return (
          <>
            <h1 className="main-header">Dashboard de operador</h1>
            <CreditInfoComponent/>
            <div className={style["content-grid"]}>
              <div className="" onClick={() => router.push("/ticketPayment")}>
                <h2 className="">Ir pagar ticket</h2>
              </div>
            </div>
          </>
        );
      case "negocio":
        return(
          <>
            <h1 className="main-header">Dashboard</h1>
            <div className={style["content-grid"]}>
              <div className="" onClick={() => router.push("/ticketValidation")}>
                <h2 className="">Validar ticket</h2>
              </div>
            </div>
          </>
        )

      case "global-admin":
          return (
    <div className={style["main-content"]}>
      {/* Header */}
      <h1 className="main-header">Dashboard</h1>

      {/* Stats Grid */}
      <div className={style["content-grid"]}>
        {/* Card */}
        <div className="" onClick={() => router.push("/locations")}>
          <h2 className="">Total de estacionamientos</h2>
          <p className="">{locations?.total ?? ""}</p>
        </div>

        <div className="" onClick={() => router.push("/kioscos")}>
          <h2 className="">Total de kioscos Activos</h2>
          <p className="">{kiosk?.total ?? ""}</p>
        </div>
      </div>
      <div className={style["content-grid"]}>
        {/* Card */}
        <div className="" onClick={() => router.push("/users")}>
          <h2 className="">Total de Usuarios</h2>
          <p className="">{users?.total ?? ""}</p>
        </div>

        <div className="" onClick={() => router.push("/users")}>
          <h2 className="">Total de operadores</h2>
          <p className="">{operators?.total ?? ""}</p>
        </div>
      </div>
    </div>
  );
      default:
        break;
    }
  };

  useEffect(() => {
    if(userType === "global-admin") {
      setLoadingGlobal(true);
      dispatch(fetchDashboardData(token as string))
      .unwrap()
      .finally(() =>  setLoadingGlobal(false))
    }
    },[])

  return <div className={style["main-content"]}>{renderDashboard()}</div>;
}
