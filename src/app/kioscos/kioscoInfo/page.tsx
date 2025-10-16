"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import cn from "classnames";

import { getKioscoById, getKioscoMoneyData } from "@/api/kioscos";
import { useAuth } from "@/context/AuthContext";
import { IKiosco } from "../page";
import { Response } from "@/api/usersApi";

import "./kioscoInfoStyles.scss";
import { MessageCircleQuestionIcon } from "lucide-react";
interface IkioscoInfo extends IKiosco {
  activationKey: string;
}
interface IkioscoMoney {
  change: {
    bills: {
      100: number;
      20: number;
      200: number;
      50: number;
    };
    coins: {
      1: number;
      10: number;
      2: number;
      5: number;
    };
    totals: {
      bill: number;
      coins: number;
      total: number;
    };
  };
  income: {
    bills: {
      100: number;
      20: number;
      200: number;
      50: number;
    };
    coins: {
      1: number;
      10: number;
      2: number;
      5: number;
    };
    totals: {
      bill: number;
      coins: number;
      total: number;
    };
  };
}

export default function Page() {
  const { isLoadingGlobal, setLoadingGlobal, token, handleToast } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [kioscoId, setKioscoId] = useState<string | null>(null);
  const [kioscoData, setKioscoData] = useState<IkioscoInfo | null>(null);
  const [displayActivationKey, setDisplayActKey] = useState(false);
  const [kioscoMoneyInfo, setKioscoMoneyInfo] = useState<IkioscoMoney | null>(
    null
  );
  const [kioscoActive, setKioscoActive] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [currentDate, setCurrenDate] = useState(new Date().toLocaleString());

  async function getKioscoData(kioscoId: string) {
    setLoadingGlobal(true);
    const req = (await getKioscoById(token as string, kioscoId)) as Response;
    if (req) {
      setLoadingGlobal(false);
      if (!req.state) {
        handleToast(
          "error",
          "Hubo un error intentando conseguir la información del kiosco, consulte a administración"
        );
        return router.replace("/kioscos");
      }
      setCurrenDate(new Date().toLocaleString());
      const kd = req.data as IkioscoInfo;
      setKioscoData(kd);
      if (kd.active === "Activado") {
        setKioscoActive(true);
        await getKioscoMoneyDataReq(kioscoId);
      }
    }
  }

  async function getKioscoMoneyDataReq(kioscoId: string) {
    setLoadingGlobal(true);
    const req = (await getKioscoMoneyData(
      token as string,
      kioscoId
    )) as Response;
    if (req) {
      setLoadingGlobal(false);
      if (!req.state) {
        handleToast(
          "error",
          "Hubo un error intentando conseguir la información financiera del kiosco, consulte a administración"
        );
      }
      const moneyD = req.data as IkioscoMoney;
      setKioscoMoneyInfo(moneyD);
    }
  }

  useEffect(() => {
    const kioscoId = searchParams.get("kioscoId");
    if (!kioscoId) router.replace("/kioscos");
    else {
      setKioscoId(kioscoId);
      getKioscoData(kioscoId);
    }
  }, []);

  const kioscoDataContent = () => {
    const info = kioscoData as IKiosco;
    const location = kioscoData?.location[0].name || "Desconocido";

    return (
      <div className="entity-content">
        <div className="main-entity-content">
          <label>
            {" "}
            <b>{"Titulo: "}</b>
            {info.title}
          </label>
          <label>
            {" "}
            <b>{"Contacto: "}</b>
            {info.contactName}
          </label>
          <label>
            {" "}
            <b>{"Teléfono de contacto: "}</b>
            {info.contactPhone}
          </label>
          <label>
            {" "}
            <b>{"Ubicación: "}</b>
            {location}
          </label>
          <label>
            {" "}
            <b>{"Número de serie: "}</b>
            {info.serialNumber}
          </label>
        </div>
        <div className="status-entity-content">
          <div className="left-data">
            <b>
              {"Estatus: "}
              <label className={cn({ offline: info.online === "Offline" })}>
                {info.online}
              </label>
            </b>
            <b>
              {"Activo: "}
              <label
                className={cn({
                  inactive: info.active === "Inactivo",
                  active: info.active === "Activado",
                })}
              >
                {info.active}
              </label>
            </b>
          </div>

          {info.active === "Inactivo" && (
            <button
              className="primary-button"
              onClick={() => setDisplayActKey(true)}
            >
              Activar Kioscos
            </button>
          )}
        </div>
      </div>
    );
  };

  const generateActivationKey = () => {
    return (
      kioscoData &&
      kioscoData.active &&
      displayActivationKey && (
        <div className="activation-key-container">
          <div className="header-activation-container">
            <div className="main-header-title">
              <h1>Codigo de activación</h1>
              <button
                onClick={() => setDisplayActKey(false)}
                className="close-button"
              >
                Cerrar
              </button>
            </div>
            <p>
              Para activar kiosco escanee el codigo QR en el lector del kiosco{" "}
            </p>
          </div>
          <QRCodeSVG
            value={kioscoData.activationKey}
            width={300}
            height={300}
          />
        </div>
      )
    );
  };

  const KioscoMoneyData = () => {
    if (!kioscoActive && isLoadingGlobal && !kioscoMoneyInfo) return null;

    const kioscoMoney = kioscoMoneyInfo as IkioscoMoney;
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
                  <label>{kioscoMoney?.change.totals.bill}</label>
                </div>
                <div className="item-content">
                  <label>Monedas</label>
                  <label>{kioscoMoney?.change.totals.coins}</label>
                </div>
              </div>
              <label className="header">Ingresos</label>
              <div className="financial-row">
                <div className="item-content">
                  <label>billetes</label>
                  <label>{kioscoMoney?.income.totals.bill}</label>
                </div>
                <div className="item-content">
                  <label>Monedas</label>
                  <label>{kioscoMoney?.income.totals.coins}</label>
                </div>
              </div>
              <label className="header">Total</label>
              <div className="financial-row">
                <div className="item-content">
                  <label>Total</label>
                  <label>{kioscoMoney?.income.totals.total}</label>
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
                  <label>{kioscoMoney?.income?.bills[200]}</label>
                </div>
                <div className="item-content">
                  <label>{"$100: "}</label>
                  <label>{kioscoMoney?.income?.bills[100]}</label>
                </div>
                <div className="item-content">
                  <label>{"$50: "}</label>
                  <label>{kioscoMoney?.income?.bills[50]}</label>
                </div>
                <div className="item-content">
                  <label>{"$20: "}</label>
                  <label>{kioscoMoney?.income?.bills[50]}</label>
                </div>
              </div>
            </div>
            <div className="financial-item">
              <label className="header">Monedas</label>
              <div className="financial-row">
                <div className="item-content">
                  <label>{"$10: "}</label>
                  <label>{kioscoMoney?.income?.coins[10]}</label>
                </div>
                <div className="item-content">
                  <label>{"$5: "}</label>
                  <label>{kioscoMoney?.income?.coins[5]}</label>
                </div>
                <div className="item-content">
                  <label>{"$2: "}</label>
                  <label>{kioscoMoney?.income?.coins[2]}</label>
                </div>
                <div className="item-content">
                  <label>{"$1: "}</label>
                  <label>{kioscoMoney?.income?.coins[1]}</label>
                </div>
              </div>
            </div>
          </div>
          <div className="financial-content">
            <div className="header">
              <label>Cambio</label>
            </div>
            <div className="financial-item">
              <label className="header">Billetes</label>
              <div className="financial-row">
                <div className="item-content">
                  <label>{"$200: "}</label>
                  <label>{kioscoMoney?.change?.bills[200]}</label>
                </div>
                <div className="item-content">
                  <label>{"$100: "}</label>
                  <label>{kioscoMoney?.change?.bills[100]}</label>
                </div>
                <div className="item-content">
                  <label>{"$50: "}</label>
                  <label>{kioscoMoney?.change?.bills[50]}</label>
                </div>
                <div className="item-content">
                  <label>{"$20: "}</label>
                  <label>{kioscoMoney?.change?.bills[50]}</label>
                </div>
              </div>
            </div>
            <div className="financial-item">
              <label className="header">Monedas</label>
              <div className="financial-row">
                <div className="item-content">
                  <label>{"$10: "}</label>
                  <label>{kioscoMoney?.change?.coins[10]}</label>
                </div>
                <div className="item-content">
                  <label>{"$5: "}</label>
                  <label>{kioscoMoney?.change?.coins[5]}</label>
                </div>
                <div className="item-content">
                  <label>{"$2: "}</label>
                  <label>{kioscoMoney?.change?.coins[2]}</label>
                </div>
                <div className="item-content">
                  <label>{"$1: "}</label>
                  <label>{kioscoMoney?.change?.coins[1]}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InformativeModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-body">
        <div className="modal-container">
          <h1>QR para manipulación de Kiosco</h1>
          <div className="content">
            <p>
              Para poder manipular el kiosco se debe generar un QR unico que
              permitirá habilitar las opciones administrativas el kiosco Solo es
              posible generar el QR desde el un teléfono celurar, un codigo QR
              tiene un tiempo de expiración de 8 hrs, no es posible generar un
              nuevo QR hasta que el actual sea cancelado por quien lo activó.
            </p>
          </div>
          <button
            className="primary-button"
            onClick={() => setShowModal(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  };
  const operatorOptions = () => {
    if (!kioscoActive && isLoadingGlobal && !kioscoMoneyInfo) return null;

    return (
      <div className="primary-content">
        <div className="header-content">
          <div className="header-row">
            <label className="header-title">Operaciones de kiosco</label>
            <button className="question-button" onClick={() => setShowModal(true)}>
              <MessageCircleQuestionIcon />
            </button>
          </div>
          <button className="primary-button">Generar codigo para kiosco</button>
        </div>
      </div>
    );
  };

  return (
    <>
      {InformativeModal()}
      <div className="kiosco-info-container">
        <div className="header-container">
          <h1 className="main-header">Información de Kiosco</h1>
          {kioscoData && (
            <button
              className="primary-button"
              onClick={() => {
                getKioscoData(kioscoId as string);
                setDisplayActKey(false);
              }}
            >
              Refrescar Datos
            </button>
          )}
        </div>
        {kioscoData != null && (
          <>
            {kioscoDataContent()}
            {generateActivationKey()}
            {KioscoMoneyData()}
            {operatorOptions()}
          </>
        )}
      </div>
    </>
  );
}
