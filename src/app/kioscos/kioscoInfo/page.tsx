"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import cn from "classnames";

import { cancelQrCode, checkActiveQrkiosco, createQrForKiosk, getKioscoById, getKioscoMoneyData, getKioskQrCodes } from "@/api/kioscos";
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

interface IqrCodeData {
  createdAt: string;
  createdBy: string;
  expired: boolean;
  expiresAt: string;
  kiosco: string;
  location: string;
  requestId: string;
  status: string;
}

export default function Page() {
  const { isLoadingGlobal, setLoadingGlobal, token, handleToast } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [kioscoId, setKioscoId] = useState<string | null>(null);
  const [kioscoData, setKioscoData] = useState<IkioscoInfo | null>(null);
  const [qrCodeList, setQrcodeList] = useState<IqrCodeData[] | []>([]);
  const [displayActivationKey, setDisplayActKey] = useState(false);
  const [canLoadMore, setCanLoadmore] = useState(false)
  const [kioscoMoneyInfo, setKioscoMoneyInfo] = useState<IkioscoMoney | null>(null);
  const [kioscoActive, setKioscoActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [qrCodesPage, setQrCodePages] = useState(1);
  const [canRequestQr, setCanRequestQr] = useState(false);
  const [showQrWarning, setShowQrWarning] = useState(false);
  const [showHandleQrCode, setShowHandleQrCode] = useState(false);
  const [QRCodeHandled, setQrCodehandled] = useState<IqrCodeData | object>({})

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

  async function getkioskQrCodesReq(kioscoId:string){
    if(qrCodesPage > 1) setLoadingGlobal(true);
    const req = await getKioskQrCodes(token as string, kioscoId, qrCodesPage) as Response;
    if(req) {
      setLoadingGlobal(false);
      if(req.state) {
        const data = req.data as IqrCodeData[];
        if(data.length > 0) {
          setQrcodeList(data)
        }
      } else {
        handleToast('error', 'Hubo un error obteniendo Qr de kiosco, intente más tarde')
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
  async function checkQrCodesActive(kioscoId:string) {
    const req = await checkActiveQrkiosco(token as string, kioscoId) as Response;
    if (req.state) return setCanRequestQr(false);
    setCanRequestQr(true);
  }

  function handleQRInactive(qrcode:IqrCodeData) {
    if (qrcode.status === 'Inactivo') {
      setQrCodehandled(qrcode);
      setShowHandleQrCode(true);
    } 
  }
  async function cancelQrCodeReq() {
    setLoadingGlobal(true);
    const data = QRCodeHandled as IqrCodeData
    const req = await cancelQrCode(token as string, data.requestId) as Response;
    if(req) {
      setLoadingGlobal(false);
      setShowHandleQrCode(false);
      if(req.state) {
      getkioskQrCodesReq(kioscoId as string);
      checkQrCodesActive(kioscoId as string);
      handleToast('success', 'codigo QR cancelado correctamente')
    } else {
      handleToast('error', 'hubo un error cancelando codigo QR')
    }
    }
  }

  useEffect(() => {
    const kioscoId = searchParams.get("kioscoId");
    if (!kioscoId) router.replace("/kioscos");
    else {
      setKioscoId(kioscoId);
      getKioscoData(kioscoId);
      getkioskQrCodesReq(kioscoId);
      checkQrCodesActive(kioscoId);
    }
  }, []);

  async function handleQrRequest(){
    if(!canRequestQr) return setShowQrWarning(true);
    setLoadingGlobal(true);
    const req = await createQrForKiosk(token as string, kioscoId as string) as Response;
    if(req) {
      setLoadingGlobal(false);
      if(req.state) {
        getkioskQrCodesReq(kioscoId as string)
        setCanRequestQr(false);
        handleToast('success', 'Se creó correctamente nuevo codigo QR');
      }else {
        handleToast('error', 'no fue posible generar QR intente más tarde');
      }
    }
  }

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
              Obtener codigo para activar kiosco
            </button>
          )}
        </div>
      </div>
    );
  };

  const generateActivationKey = () => {
    
    const qrCode  = kioscoData && `${kioscoData.activationKey}&${kioscoData.location[0].id}&${kioscoData.kioscoId}`;
    if (qrCode)
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
            <p>{qrCode}</p>
          </div>
          <QRCodeSVG
            value={qrCode}
            width={300}
            height={300}
          />
        </div>
      )
    );
  };

  const KioscoMoneyData = () => {
    if (!kioscoActive || isLoadingGlobal || !kioscoMoneyInfo) return null;

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
  const qrRequestNotAllowed = () => {
    if (!showQrWarning) return null;

    return (
      <div className="modal-body">
        <div className="modal-container">
          <h1>Solicitud de QR denegada</h1>
          <div className="content">
            <p>
              No es posible Genrear un nuevo codigo QR, existe un Qr Inactivo, cancelelo o si se encuentre vigente utilicelo en el kiosco.
            </p>
          </div>
          <button
            className="primary-button"
            onClick={() => setShowQrWarning(false)}
          >
            Aceptar
          </button>
        </div>
      </div>
    );
  };
  const handleInactiveQrCodeModal = () => {
    if (!showHandleQrCode) return null;
    const qrdata = QRCodeHandled as IqrCodeData;
    const MQRcode = `m&${qrdata.requestId}`
    return (
      <div className="modal-body">
        <div className="modal-container">
          <h1>Información de QR</h1>
          <p>{MQRcode}</p>
            {
              !qrdata.expired ? (
                <div className="content">
                  <p>Escanee codigo en kiosco para habilitar modo administrador</p>
                <QRCodeSVG width={300} height={300} value={MQRcode}/>
                </div>
              ) : (
                <div className="content">
                <p>
                Este codigo ya ha expirado, ¿Desea Cancelarlo?
            </p>
          </div>
              )
            }
          <div className="actions-modal-buttons">
            <button
              className="primary-button secondary"
              onClick={() => setShowHandleQrCode(false)}
              >
              Salir
            </button>
            <button
              className="primary-button"
              onClick={cancelQrCodeReq}
              >
              Cancelar QR
            </button>
            </div>
        </div>
      </div>
    );
  };

  const operatorOptions = () => {
    if (!kioscoActive || isLoadingGlobal || !kioscoMoneyInfo) return null;

    return (
      <div className="primary-content dataSet">
        <div className="header-content">
          <div className="header-row">
            <label className="header-title">Operaciones de kiosco</label>
            <button
              className="question-button"
              onClick={() => setShowModal(true)}
            >
              <MessageCircleQuestionIcon />
            </button>
          </div>
          <button className={cn("primary-button", {'disable': !canRequestQr })} onClick={handleQrRequest}>Generar codigo para kiosco</button>
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
              {Array.isArray(qrCodeList) && qrCodeList.length > 0 ? (
                qrCodeList.map((qrCode: IqrCodeData) => (
                  <tr
                    key={qrCode.requestId}
                    className=""
                    onClick={() => handleQRInactive(qrCode)}
                  >
                    <td className="">{qrCode.createdBy}</td>
                    <td className="">{qrCode.createdAt} </td>
                    <td className="">{qrCode.status === 'Cancelado' ? 'Cancelado': qrCode.expired ? 'Expirado': 'Activo'}</td>
                    <td className="">{qrCode.expiresAt}</td>
                    <td className="">{qrCode.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="">
                    Sin datos
                  </td>
                </tr>
              )}
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
      {InformativeModal()}
      {qrRequestNotAllowed()}
      {handleInactiveQrCodeModal()}
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
