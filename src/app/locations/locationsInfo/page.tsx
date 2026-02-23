"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { lazy, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

import cn from "classnames";

import { useAuth } from "@/context/AuthContext";

import "./kioscoInfoStyles.scss";
import {
  fetchLocationInfo,
  fetchTickets,
  ITicketsParams,
} from "@/store/slices/locationInfoSlice";
import { transformToCurrency } from "@/assets/utils";

export default function Page() {
  const { isLoadingGlobal, setLoadingGlobal, token, handleToast } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const transformDate = (date: string) => {
    const newDate = new Date(date).toLocaleString();
    return newDate;
  };

  const { locationData } = useSelector(
    (state: RootState) => state.locationInfo,
  );

  const { tickets, loading, error, errorMessage, canLoadMore } = useSelector(
    (state: RootState) => state.ticketsInfo,
  );

  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentDate, setCurrenDate] = useState(new Date().toLocaleString());
  const [locationId, setLocationId] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [ticketsPage, setTicketsPage] = useState(1);
  const [ticketsLimit, setCreditsLimit] = useState(2);

  function getLocationInfo(token: string, locationId: string) {
    setLoadingGlobal(true);
    dispatch(fetchLocationInfo({ token, locationId }))
      .unwrap()
      .finally(() => setLoadingGlobal(false));
  }

  function dispatchTickets(params: ITicketsParams) {
    setLoadingGlobal(true);
    dispatch(fetchTickets(params))
      .unwrap()
      .finally(() => setLoadingGlobal(false));
  }

  function loadMore(){
    if (token && locationId) {
      const page = ticketsPage + 1;
      setTicketsPage(page);
        dispatchTickets({
          token,
          locationId,
          page,
          limit: ticketsLimit,
          fromDate,
          toDate,
        });
      }
  }


  useEffect(() => {
    const locationId = searchParams.get("locationId");
    if (locationId) {
      setLocationId(locationId);
      getLocationInfo(token as string, locationId);
      if (token && locationId) {
        dispatchTickets({
          token,
          locationId,
          page: ticketsPage,
          limit: ticketsLimit,
          fromDate,
          toDate,
        });
      }
    } else router.replace("/locations");
  }, []);

  function getTickets() {
    if (!token || !locationId) return;
    dispatchTickets({
      token,
      locationId,
      page: 1,
      limit: ticketsLimit,
      fromDate,
      toDate,
    });
  }

  const LocationGeneralData = () => {
    return (
      <div className="entity-content">
        <div className="main-entity-content">
          <label>
            {" "}
            <b>{"Ubicación: "}</b>
            {locationData.title}
          </label>
          <label>
            {" "}
            <b>{"Contacto: "}</b>
            {locationData.contact}
          </label>
          <label>
            {" "}
            <b>{"Dirección: "}</b>
            {locationData.address}
          </label>
          <label>
            {" "}
            <b>{"Total de kioscos: "}</b>
            {locationData.kioscos && Array.isArray(locationData.kioscos)
              ? locationData.kioscos.length
              : ""}
          </label>
          <label>
            {" "}
            <b>{"Total de operadores: "}</b>
            {locationData.operators && Array.isArray(locationData.operators)
              ? locationData.operators.length
              : ""}
          </label>
        </div>
      </div>
    );
  };

  const operatorsList = () => {
    return (
      <div className="primary-content dataSet">
        <div className="header-content">
          <div className="header-row">
            <label className="header-title">Operadores</label>
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="">Item</th>
                <th className="">Operador</th>
              </tr>
            </thead>
            <tbody>
              {locationData?.operators &&
              Array.isArray(locationData.operators) &&
              locationData.operators.length !== 0 ? (
                locationData.operators.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2}>Sin datos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const kioskList = () => {
    return (
      <div className="primary-content dataSet">
        <div className="header-content">
          <div className="header-row">
            <label className="header-title">Kioscos</label>
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="">Item</th>
                <th className="">Operador</th>
              </tr>
            </thead>
            <tbody>
              {locationData?.kioscos &&
              Array.isArray(locationData.kioscos) &&
              locationData.kioscos.length !== 0 ? (
                locationData.kioscos.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2}>Sin datos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const financialContent = () => {
    return (
      <div className="primary-content dataSet">
        <div className="header-content">
          <div className="header-row">
            <label className="header-title">Datos Financieros</label>
          </div>
          <label>
            {" "}
            <b>{"Fecha Actual: "}</b> {currentDate}
          </label>
          <div className="financial-content-body">
            <div className="row">
              <b>Información de dia</b>
              <div className="content-row">
                <label>
                  <b>{"Pagos del dia: "}</b>test
                </label>
                <label>
                  <b>{"Entradas del día: "}</b>test
                </label>
                <label>
                  <b>{"Tickets por pagar: "}</b>test
                </label>
              </div>
            </div>
            <div className="row">
              <label>Buscar por fecha</label>
              <div className="content-row">
                <div className="input-dates-row">
                  <div className="date-form-input">
                    <label htmlFor="">Desde:</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                  <div className="date-form-input">
                    <label htmlFor="">Hasta:</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                  <button
                    className="primary-button"
                    onClick={() => {
                      setTicketsPage(1)
                      getTickets();
                    }}
                  >
                    Buscar
                  </button>
                  <label htmlFor="">
                    {" "}
                    <b>Viendo Fecha desde: </b> {fromDate}
                  </label>
                  <label htmlFor="">
                    {" "}
                    <b>Viendo Fecha hasta: </b> {toDate}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ticketList = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <label htmlFor="">Lista de tickets</label>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>item</th>
                <th>Fecha/Entrada</th>
                <th>Puerta</th>
                <th>Estado</th>
                <th>Coche/Dentro</th>
                <th>Fecha/Salida</th>
                <th>Validado</th>
                <th>fecha/Validacion</th>
                <th>Total/Pagado</th>
              </tr>
            </thead>
            <tbody>
              {tickets?.length === 0 ? (
                <tr>
                  <td colSpan={9}>Sin datos</td>
                </tr>
              ) : (
                tickets?.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      {item.fechaEntrada && transformDate(item.fechaEntrada)}
                    </td>
                    <td>{item.gateLabel}</td>
                    <td>{item.estado}</td>
                    <td>{item.fechaSalida ? "No" : "Si"}</td>
                    <td>
                      {item.fechaSalida && transformDate(item.fechaSalida)}
                    </td>
                    <td>{item?.parkingValidation ? "Si" : "No"}</td>
                    <td>
                      {item.validatedAt && transformDate(item.validatedAt)}
                    </td>
                    <td>
                      {item.dataPayment.length !== 0 &&
                        transformToCurrency(
                          item.dataPayment.reduce(
                            (acc, val, index) => (acc += val.amount),
                            0,
                          ),
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {canLoadMore && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button className="primary-button" onClick={loadMore}>Cargar Mas</button>
          </div>
        )}
      </div>
    );
  };

  console.log(tickets);
  return (
    <>
      <div className="kiosco-info-container">
        <div className="header-container">
          <h1 className="main-header">Información de Ubicación</h1>
          <button className="primary-button">Refrescar Datos</button>
        </div>
        <button
          className="primary-button"
          onClick={() => router.push(`/payTicket/location?id=${locationId}`)}
        >
          {" "}
          Pagar boleto
        </button>
        {LocationGeneralData()}
        {operatorsList()}
        {kioskList()}
        {financialContent()}
        {ticketList()}
      </div>
    </>
  );
}
