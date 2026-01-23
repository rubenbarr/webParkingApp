"use client";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { RootState, AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import style from "./dashboardStyle.module.scss";
import CreditInfoComponent from "@/components/CreditInfo/CreditInfo";

export default function DashboardPage() {
  const router = useRouter();

  const { token, setLoadingGlobal, userType } = useAuth();

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

      default:
        break;
    }
  };

  return <div className={style["main-content"]}>{renderDashboard()}</div>;
}
