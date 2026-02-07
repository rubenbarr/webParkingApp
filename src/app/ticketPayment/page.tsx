"use client";
import "./payticket.scss";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getMyLocations } from "@/api/locationApi";
import { Response } from "@/api/usersApi";

import CreditInfo from "@/components/CreditInfo/CreditInfo";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { ICredit } from "@/types/credits";
import { fetchUserCredits } from "@/store/slices/creditSlice";
import { transformToCurrency } from "@/assets/utils";

interface ILocation {
  title: string;
  address: string;
  contact: string;
  createdAt?: string;
  createdBy?: string;
  locationId?: string;
  totalKioscos?: number;
}

export default function PayTicketPage() {
  const { setLoadingGlobal, token, handleToast } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const { hasCredit, creditInfo, userCredits } = useSelector(
    (state: RootState) => state.creditInfo,
  );
  const router = useRouter();
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [loadingCredits, setLoadingCredits] = useState<boolean>(false);
  const [canloadMore, setCanLoadmore] = useState<boolean>(true);
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<ILocation[]>([]);
  const [filterValue, setFilterValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const canReturnCredit = () => {
    return creditInfo?.status === "cobrado";
  };
  const canPayTicket = () => {
    return (
      creditInfo?.status === "disponible" || creditInfo?.status === "activo"
    );
  };

  function getUserCreditsReq() {
    setLoadingGlobal(true);
    dispatch(fetchUserCredits({token: token as string, page, limit}))
    .unwrap()
    .finally(()=> setLoadingGlobal(false));
  }
  async function getLocationsReq(page: number, isDeleted: boolean = false) {
    setLoadingGlobal(true);
    const req = (await getMyLocations(
      token as string,
      page,
      limit,
    )) as Response;
    if (req) {
      setLoadingGlobal(false);
      if (req.state) {
        const data = req.data as ILocation[];
        if (data.length === 0) {
          if (isDeleted) {
            setFilteredLocations([]);
            setLocations([]);
          }
          return setCanLoadmore(false);
        }
        if (locations?.length === 0) {
          setFilteredLocations(data);
          return setLocations(data);
        }
        if (page === 1 && locations?.length !== 0) {
          setFilteredLocations(data);
          return setLocations(data);
        } else {
          setFilteredLocations((prev) => [...prev, ...data]);
          return setLocations((prev) => [...prev, ...data]);
        }
      } else {
        handleToast(
          "error",
          `Hubo un error buscando Ubicacions, error ${req.message}`,
        );
      }
    }
  }
  async function loadMoreLocations() {
    const nextPage = page + 1;
    setPage(nextPage);
    await getLocationsReq(nextPage);
  }
  const setFilterValues = () => {
    if (locations.length === 0) return;
    const filterVals = locations.filter(
      (i) =>
        i.address
          .trim()
          .toLowerCase()
          .includes(filterValue.trim().toLowerCase()) ||
        i.contact
          .trim()
          .toLowerCase()
          .includes(filterValue.trim().toLocaleLowerCase()) ||
        i.title
          .trim()
          .toLowerCase()
          .includes(filterValue.trim().toLocaleLowerCase()),
    );
    setFilteredLocations([...filterVals]);
    if (filterValue === "") setFilteredLocations([...locations]);
  };

  async function handleRefreshFunctions() {
    await Promise.all([getLocationsReq(page)]).then(() =>
      setLoadingData(false),
    );
  }

  useEffect(() => {
    handleRefreshFunctions();
    getUserCreditsReq();
  }, []);

  useEffect(() => {
    setFilterValues();
  }, [filterValue]);

  const locationInfo = () => {
    if (!hasCredit || !canPayTicket()) return null;
    return (
      <>
        <div className="header-container">
          <h1 className="main-header">Seleccion de Ubicacion</h1>
          <label>Seleccione una ubicación para poder pagar un ticket</label>
        </div>

        <input
          type="text"
          placeholder="Buscar ubicación/Contacto"
          className="filter-input"
          value={filterValue}
          onChange={(e) => {
            setFilterValue(e.target.value);
          }}
        />
        <button className="primary-button">Refrescar</button>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="">item</th>
                <th className="">Ubicación</th>
                <th className="">dirección</th>
                <th className="">contacto</th>
                <th className="">Usar</th>
              </tr>
            </thead>
            <tbody>
              {loadingData ? (
                <tr>
                  <td colSpan={5}>Cargando datos...</td>{" "}
                </tr>
              ) : filteredLocations?.length === 0 ? (
                <tr>
                  <td colSpan={5}>Sin datos</td>
                </tr>
              ) : (
                filteredLocations?.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() =>
                      router.push(
                        "/ticketPayment/location?id=" + item.locationId,
                      )
                    }
                  >
                    <td>{(index += 1)}</td>
                    <td>{item.title}</td>
                    <td>{item.address}</td>
                    <td>{item.contact}</td>
                    <td
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        display: "flex",
                        width: "100%",
                      }}
                    >
                      <ArrowRightIcon />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {canloadMore && (
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button className="primary-button" onClick={loadMoreLocations}>
              cargar más
            </button>
          </div>
        )}
      </>
    );
  };
  const creditsInfo = () => {
    return (
      <>
        <div className="header-container">
          <h1 className="main-header">Mis creditos</h1>
          <label>Historial de mis creditos</label>
        </div>

        <button className="primary-button">Refrescar</button>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="">item</th>
                <th className="">Fecha/Creacion</th>
                <th className="">Creado por</th>
                <th className="">Estatus</th>
                <th className="">$Monto inicial</th>
                <th className="">$Monto Final</th>
                <th className="">$Total Entregado</th>
                <th className="">$Cambio inicial</th>
                <th className="">$Cambio final</th>
                <th className="">$Fecha de cierre</th>
              </tr>
            </thead>
            <tbody>
              {loadingCredits ? (
                <tr>
                  <td colSpan={7}>Cargando datos...</td>{" "}
                </tr>
              ) : userCredits?.length === 0 ? (
                <tr>
                  <td colSpan={7}>Sin datos</td>
                </tr>
              ) : (
                userCredits?.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() =>
                      router.push(
                        "/ticketPayment/creditInfo?id=" + item.requestId,
                      )
                    }
                  >
                    <td>{(index += 1)}</td>
                    <td>{item.createdAt}</td>
                    <td>{item.createdBy}</td>
                    <td>{item.status}</td>
                    <td>{item.initial_amount ?  transformToCurrency(item.initial_amount): "$0.0"}</td>
                    <td>{item.finalAmount ?  transformToCurrency(item.finalAmount): "$0.0"}</td>
                    <td>{item.credit_delivered ?  transformToCurrency(item.credit_delivered): "$0.0"}</td>
                    <td>{item.initial_change ?  transformToCurrency(item.initial_change): "$0.0"}</td>
                    <td>{item.current_change ?  transformToCurrency(item.current_change): "$0.0"}</td>
                    <td>{item.chargeAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {canloadMore && (
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button className="primary-button" onClick={loadMoreLocations}>
              cargar más
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="main-content">
        <h1 className="main-header">Modulo de pago</h1>
        {canReturnCredit() && (
          <div className="options-header">
            <a
              className="content-action"
              onClick={() => router.push("/ticketPayment/creditReturn")}
            >
              Informacion de credito
            </a>
          </div>
        )}
        <CreditInfo
          shouldDisplayCreditInfo={creditInfo?.status === "cobrado"}
        />
        {creditsInfo()}
        {locationInfo()}
      </div>
    </>
  );
}
