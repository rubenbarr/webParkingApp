"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

import cn from "classnames";

import { useAuth } from "@/context/AuthContext";

import "./kioscoInfoStyles.scss";
import { fetchLocationInfo } from "@/store/slices/locationInfoSlice";


export default function Page() {
  const { isLoadingGlobal, setLoadingGlobal, token, handleToast } = useAuth();
  const dispatch = useDispatch<AppDispatch>();


  const  {locationData, error} = useSelector((state:RootState) => state.locationInfo);
    
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentDate, setCurrenDate] = useState(new Date().toLocaleString());
  const [locationId, setLocationId] = useState<string | null>(null);

  function getLocationInfo(token:string, locationId:string) {
    setLoadingGlobal(true);
    dispatch(fetchLocationInfo({token, locationId}))
    .unwrap()
    .finally(() => setLoadingGlobal(false))
  }

  useEffect(() => {
    const locationId = searchParams.get('locationId')
    if(locationId) {
      setLocationId(locationId);
      getLocationInfo(token as string, locationId)
    } else router.replace('/locations')
  },[])

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
              {locationData.kioscos && Array.isArray(locationData.kioscos) ? locationData.kioscos.length : ''}
            </label>
            <label>
              {" "}
              <b>{"Total de operadores: "}</b>
              {locationData.operators && Array.isArray(locationData.operators) ? locationData.operators.length : ''}
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
              {  locationData?.operators && Array.isArray(locationData.operators) && locationData.operators.length !== 0 ?  locationData.operators.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                </tr>
              )): (
                <tr>
                  <td colSpan={2}>Sin datos</td>
                </tr>
              )
            }
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
              {  locationData?.kioscos && Array.isArray(locationData.kioscos) && locationData.kioscos.length !== 0 ?  locationData.kioscos.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                </tr>
              )): (
                <tr>
                  <td colSpan={2}>Sin datos</td>
                </tr>
              )
            }
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
              <label> <b>{"Fecha Actual: "}</b> {currentDate}</label>    
          <div className="financial-content-body">
            <div className="row">
              <b>Información de dia</b>
              <div className="content-row">
                <label><b>{"Pagos del dia: " }</b>test</label>
                <label><b>{"Entradas del día: " }</b>test</label>
                <label><b>{"Tickets por pagar: " }</b>test</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="kiosco-info-container">
        <div className="header-container">
          <h1 className="main-header">Información de Ubicación</h1>
            <button
              className="primary-button"
            >
              Refrescar Datos
            </button>
        </div>
        <button className="primary-button" onClick={() => router.push(`/payTicket?locationId=${locationId}` )}> Pagar boleto</button>
            {LocationGeneralData()}
            {financialContent()}
            {operatorsList()}
            {kioskList()}

      </div>
    </>
  );
}
