"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import cn from "classnames";

import { useAuth } from "@/context/AuthContext";

import { Response } from "@/api/usersApi";

import "./kioscoInfoStyles.scss";



interface ILocation {
  title: string;
  address: string;
  contact: string;
  kioscos: string[] | [];
  operators: string[] | [];
  createdAt?: string;
  createdBy?: string;
  locationId?: string;
  totalKioscos?: number;
  serialNumber?: string;
}

export default function Page() {
  const { isLoadingGlobal, setLoadingGlobal, token, handleToast } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

    const initialData = {
    title: "",
    address: "",
    contact: "",
    kioscos: [],
    operators: [],
  };

  const [canLoadMore, setCanLoadMore] = useState(false);
  const [currentDate, setCurrenDate] = useState(new Date().toLocaleString());
  const [locationData, setLocationData] = useState<ILocation>(initialData)


    const LocationGeneralData = () => {
  
      return (
        <div className="entity-content">
          <div className="main-entity-content">
            <label>
              {" "}
              <b>{"Titulo: "}</b>
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
              {locationData.kioscos.length}
            </label>
          </div>
        </div>
      );
    };





  const KioscoMoneyData = () => {

    return (
      <div>
        <label style={{ fontWeight: "bold" }}>Datos Financieros</label>
        <p>
          {"Ultima actualización: "} <b>{currentDate}</b>
        </p>

        <div className="primary-content">
          <div className="financial-content">
            <div className="header">
              <label>Resumen</label>
            </div>
            <div className="financial-item">
              <label className="header">Cambio</label>
              <div className="financial-row">
                <div className="item-content">
                  <label>billetes</label>
                  <label>{}</label>
                </div>
                <div className="item-content">
                  <label>Monedas</label>
                  <label>{}</label>
                </div>
              </div>
              <label className="header">Ingresos</label>
              <div className="financial-row">
                <div className="item-content">
                  <label>billetes</label>
                  <label>{}</label>
                </div>
                <div className="item-content">
                  <label>Monedas</label>
                  <label>{}</label>
                </div>
              </div>
              <label className="header">Total</label>
              <div className="financial-row">
                <div className="item-content">
                  <label>Total</label>
                  <label>{}</label>
                </div>
              </div>
            </div>
          </div>
          <div className="financial-content">
            <div className="header">
              <label>Ingresos</label>
            </div>
            <div className="financial-item">
              <label className="header">Billetes</label>
              <div className="financial-row">
                <div className="item-content">
                  <label>{"$200: "}</label>
                  <label>{}</label>
                </div>
                <div className="item-content">
                  <label>{"$100: "}</label>
                  <label>{}</label>
                </div>
                <div className="item-content">
                  <label>{"$50: "}</label>
                  <label>{}</label>
                </div>
                <div className="item-content">
                  <label>{"$20: "}</label>
                  <label>{}</label>
                </div>
              </div>
            </div>
            <div className="financial-item">
              <label className="header">Monedas</label>
              <div className="financial-row">
                <div className="item-content">
                  <label>{"$10: "}</label>
                  <label>{}</label>
                </div>
                <div className="item-content">
                  <label>{"$5: "}</label>
                  <label>{}</label>
                </div>
                <div className="item-content">
                  <label>{"$2: "}</label>
                  <label>{}</label>
                </div>
                <div className="item-content">
                  <label>{"$1: "}</label>
                  <label>{}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };



  const operatorOptions = () => {

    return (
      <div className="primary-content dataSet">
        <div className="header-content">
          <div className="header-row">
            <label className="header-title">Operaciones de kiosco</label>
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="">Creado Por</th>
                <th className="">Fecha/Creación</th>
                <th className="">Estatus de Codigo</th>
                <th className="">Fecha/Expiración</th>
                <th className="">Estatus</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>
        </div>
        <div className={"load-more-container"}>
            {canLoadMore ? (
              <button className={"load-more-button"} onClick={() => null}>
                Cargar mas
              </button>
            ) : (
              null
            )}
          </div>
      </div>
    );
  };

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
            {LocationGeneralData()}
            {KioscoMoneyData()}
            {operatorOptions()}

      </div>
    </>
  );
}
