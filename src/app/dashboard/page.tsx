"use client";
import { useDispatch, UseDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RootState, AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Response } from "@/api/usersApi";
import { getTotalKiosk, getTotalLocations, getTotalOperators, getTotalUsers } from "@/api/globals";

import style from "./dashboardStyle.module.scss";

type Data = {
  _id: string;
  total: string;
};

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { locations, loading } = useSelector( (state: RootState) => state.dashboard)
  const { token, setLoadingGlobal } = useAuth();
  const router = useRouter();
  const [locationsData, setLocationsData] = useState<Data | null>(null);
  const [kioskData, setKioskData] = useState<Data | null>(null);
  const [totalUsers, setTotal] = useState<Data | null>(null);
  const [totalOperators, setTotalOperators] = useState<Data | null>(null);

  const getTotalLocationsReq = async() => await getTotalLocations(token as string) as Response;
  const getTotalActiveKioskReq = async() => await getTotalKiosk(token as string) as Response;
  const getTotalUsersReq = async() =>  await getTotalUsers(token as string) as Response;
  const getTotalOperatorsReq = async() =>  await getTotalOperators(token as string) as Response;
  
  // useEffect(() => {
  //   setLoadingGlobal(true)
  //   const fetchData = async () => {
  //     try {
  //       const [locRes, kioskres, usersReq, operatorsReq] = await Promise.all([
  //         getTotalLocationsReq(),
  //         getTotalActiveKioskReq(),
  //         getTotalUsersReq(),
  //         getTotalOperatorsReq()
  //       ]);
  //       if (locRes.state) {
  //         const data = locRes.data as string[];
  //         const t = data[0] as unknown as Data;
  //         setLocationsData(t);
  //       }
  //       if (kioskres.state) {
  //         const data = kioskres.data as string[];
  //         const t = data[0] as unknown as Data;
  //         setKioskData(t);
  //       }
  //       if(usersReq.state) {
  //         const data = usersReq.data as string[]
  //         const t = data[0];
  //         setTotal(t as unknown as Data)
  //       }
  //       if(operatorsReq.state) {
  //         const data = operatorsReq.data as string[]
  //         const t = data[0] as unknown as Data
  //         setTotalOperators(t)
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     } finally {
  //       setLoadingGlobal(false)
  //     }
  //   };
  //   fetchData();
  // }, []);

  return (
    <div className={style["main-content"]}>
      {/* Header */}
      <h1 className="main-header">Dashboard</h1>

      {/* Stats Grid */}
      <div className={style["content-grid"]}>
        {/* Card */}
        <div className="" onClick={() => router.push("/locations")}>
          <h2 className="">Total de estacionamientos</h2>
          <p className="">{locationsData?.total ?? ""}</p>
        </div>

        <div className="" onClick={() => router.push("/kioscos")}>
          <h2 className="">Total de kioscos Activos</h2>
          <p className="">{kioskData?.total ?? ""}</p>
        </div>
      </div>
      <div className={style["content-grid"]}>
        {/* Card */}
        <div className="" onClick={() => router.push("/users")}>
          <h2 className="">Total de Usuarios</h2>
          <p className="">{totalUsers?.total ?? ""}</p>
        </div>

        <div className="" onClick={() => router.push("/users")}>
          <h2 className="">Total de operadores</h2>
          <p className="">{totalOperators?.total ?? ""}</p>
        </div>
      </div>
    </div>
  );
}
