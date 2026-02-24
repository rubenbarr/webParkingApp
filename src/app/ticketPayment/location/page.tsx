/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import "./payticketlocation.scss";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { getLocationById } from "@/api/locationApi";
import { TrashIcon } from "lucide-react";
import { Response } from "@/api/usersApi";
import { getTicketInfoById, payTicket } from "@/api/ticketsApi";
import cn from "classnames";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import CreditInfoComponent from "@/components/CreditInfo/CreditInfo";
import { fetchCreditInfo } from "@/store/slices/creditSlice";
import { ITicket } from "@/types/ticket";

interface ILocation {
  title: string;
  address: string;
  contact: string;
  createdAt?: string;
  createdBy?: string;
  locationId?: string;
  totalKioscos?: number;
}

interface Ipayment {
  bills: Record<any, any>;
  coins: Record<any, any>;
}

export default function PayTicketInLocation() {
  // global statements/data

  const { setLoadingGlobal, token, handleToast, isLoadingGlobal } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  // end of global statements/data

  // selector data

  const { hasCredit, isLoading, hasFetched } = useSelector(
    (state: RootState) => state.creditInfo,
  );

  // end selector data

  // initial state
  const initialBillsCoinsInfo = {
    bills: {
      20: 0,
      50: 0,
      100: 0,
      200: 0,
      500: 0,
    },
    coins: {
      0.5: 0,
      1: 0,
      2: 0,
      5: 0,
      10: 0,
    },
  };
  const initialPaymentState = {
    totalPayed: 0,
    totalBills: 0,
    totalCoins: 0,
  };
  // end initial state
  const [locationInfo, setLocationInfo] = useState<ILocation | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string>("");
  const [shouldDisplayTicketInfo, setShouldDisplayTicketInfo] =
    useState<boolean>(false);
  const [canPayTicket, setCanPayTicket] = useState<boolean>(false);
  const [canSubmitPayment, setCanSubmitPayment] = useState(false);
  const [paymentState, setPaymentState] = useState({
    totalPayed: 0,
    totalBills: 0,
    totalCoins: 0,
  });

  function refreshCredit() {
    setLoadingGlobal(true);
    dispatch(fetchCreditInfo({ token: token as string }))
      .unwrap()
      .finally(() => setLoadingGlobal(false));
  }

  const [ticketInfo, setTicketInfo] = useState<ITicket | null>(null);
  const [payment, setPayment] = useState<Ipayment>({
    bills: {
      20: 0,
      50: 0,
      100: 0,
      200: 0,
      500: 0,
    },
    coins: {
      0.5: 0,
      1: 0,
      2: 0,
      5: 0,
      10: 0,
    },
  });

  async function getLocationInfo(locationId: string) {
    try {
      setLoadingGlobal(true);
      const req = (await getLocationById(
        token as string,
        locationId,
      )) as Response;
      if (!req.state) return router.replace("/payTicket");
      const data = req.data as ILocation;
      setLocationInfo(data);
    } catch (error) {
      handleToast("error", `Hubo un error: ${error}`);
      return router.replace("/payTicket");
    } finally {
      setLoadingGlobal(false);
    }
  }

  async function getTicketInfo() {
    if (ticketId === "") return;
    try {
      setLoadingGlobal(true);
      const req = (await getTicketInfoById(
        token as string,
        ticketId as string,
        locationId as string,
      )) as Response;
      const data = req.data as ITicket;
      if (!req.state) {
        setShouldDisplayTicketInfo(false);
        handleToast(
          "error",
          req.message ||
            req?.error ||
            "Intenté nuevamente o comuniquese con administración",
        );
      } else {
        setShouldDisplayTicketInfo(true);
        setTicketInfo(data);
        if (data.estado === "pendiente" || data.repago) setCanPayTicket(true);
        else setCanPayTicket(false);
      }
    } catch (error) {
      handleToast("error", `Hubo un error: ${error}`);
    } finally {
      setLoadingGlobal(false);
    }
  }

  async function payTicketRequest() {
    if (!canSubmitPayment) return;
    const data = {
      amount: ticketInfo?.total_a_pagar,
      paymentData: payment,
      totalPayed: paymentState.totalPayed,
      change: paymentState.totalPayed - (ticketInfo?.total_a_pagar as number),
    };
    setCanSubmitPayment(false);
    setLoadingGlobal(true);
    setTicketId("");
    setPaymentState(initialPaymentState);
    setPayment(initialBillsCoinsInfo);
    setCanPayTicket(false);
    try {
      const req = (await payTicket(
        token as string,
        ticketInfo?.ticketId as string,
        data,
      )) as Response;
      if (!req.state) return handleToast("error", req?.message);
      handleToast("success", req.message);
      setShouldDisplayTicketInfo(false);
      refreshCredit();
    } catch (error: any) {
      handleToast(
        "error",
        error?.message || "Hubo un error, intente más tarde",
      );
    } finally {
      setShouldDisplayTicketInfo(false);
      setCanSubmitPayment(true);
      setLoadingGlobal(false);
      refreshCredit();
    }
  }

  const formatToCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const transformToCurrency = (value: number) => formatToCurrency.format(value);

  const transformDate = (date: string) => {
    const newDate = new Date(date).toLocaleString("es-MX", {
      timeZone: "America/Mexico_City",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    return newDate;
  };

  const totalPay = () => {
    const totalBills =
      Object.entries(payment["bills"]).reduce(
        (acc, [currency, total]) => acc + Number(currency) * total,
        0,
      ) || 0;
    const totalCoins =
      Object.entries(payment["coins"]).reduce(
        (acc, [currency, total]) => acc + Number(currency) * total,
        0,
      ) || 0;

    const totalPayed = totalBills + totalCoins;
    setPaymentState({ totalPayed, totalBills, totalCoins });
    setCanSubmitPayment(
      totalBills + totalCoins > 0 &&
        totalBills + totalCoins >= (ticketInfo?.total_a_pagar as number),
    );
  };

  const payTicketActions = () => {
    return (
      shouldDisplayTicketInfo &&
      canPayTicket &&  (
        <div className="payment-content">
          <div className="header-payment-content">
            <label>
              {" "}
              <b>Pago de Boleto </b>
            </label>
            <div className="payment-total-info">
              <label>
                <b>Total a pagar: </b>
                {ticketInfo?.total_a_pagar &&
                  transformToCurrency(ticketInfo?.total_a_pagar)}
              </label>
              <label>
                <b>Total pagado: </b>
                {transformToCurrency(paymentState.totalPayed)}
              </label>
              <label>
                <b>Total Restante: </b>
                {ticketInfo?.total_a_pagar &&
                paymentState.totalPayed <= ticketInfo.total_a_pagar
                  ? transformToCurrency(
                      ticketInfo?.total_a_pagar - paymentState.totalPayed,
                    )
                  : 0}
              </label>
              <label>
                <b>Cambio: </b>
                {ticketInfo?.total_a_pagar &&
                paymentState.totalPayed > 0 &&
                paymentState.totalPayed > ticketInfo.total_a_pagar
                  ? transformToCurrency(
                      paymentState.totalPayed - ticketInfo?.total_a_pagar,
                    )
                  : transformToCurrency(0)}
              </label>
            </div>
          </div>
          <div className="payment-container">
            <label>Pago con billetes</label>
            <label>
              <b>{"Total Pagado con billetes: "}</b>
              {transformToCurrency(paymentState.totalBills)}
            </label>
            <div className="payment-option-container">
              <div className="payment-option">
                <label>
                  <b>Billetes de 20</b>
                </label>
                <input
                  type="number"
                  className="filter-input"
                  value={payment.bills["20"]}
                  min={0}
                  onChange={(e) => {
                    setPayment((prev) => ({
                      ...prev,
                      bills: {
                        ...prev.bills,
                        20:
                          e.target.value === "" ? 0 : parseInt(e.target.value),
                      },
                    }));
                  }}
                />
              </div>
              <div className="payment-option">
                <label>
                  <b>Billetes de 50</b>
                </label>
                <input
                  type="number"
                  className="filter-input"
                  value={payment.bills["50"]}
                  min={0}
                  onChange={(e) => {
                    setPayment((prev) => ({
                      ...prev,
                      bills: {
                        ...prev.bills,
                        50:
                          e.target.value === "" ? 0 : parseInt(e.target.value),
                      },
                    }));
                  }}
                />
              </div>
              <div className="payment-option">
                <label>
                  <b>Billetes de 100</b>
                </label>

                <input
                  type="number"
                  className="filter-input"
                  value={payment.bills["100"]}
                  min={0}
                  onChange={(e) => {
                    setPayment((prev) => ({
                      ...prev,
                      bills: {
                        ...prev.bills,
                        100:
                          e.target.value === "" ? 0 : parseInt(e.target.value),
                      },
                    }));
                  }}
                />
              </div>
              <div className="payment-option">
                <label>
                  <b>Billetes de 200</b>
                </label>

                <input
                  type="number"
                  className="filter-input"
                  value={payment.bills["200"]}
                  min={0}
                  onChange={(e) => {
                    setPayment((prev) => ({
                      ...prev,
                      bills: {
                        ...prev.bills,
                        200:
                          e.target.value === "" ? 0 : parseInt(e.target.value),
                      },
                    }));
                  }}
                />
              </div>
              <div className="payment-option">
                <label>
                  <b>Billetes de 500</b>
                </label>

                <input
                  type="number"
                  className="filter-input"
                  value={payment.bills["500"]}
                  min={0}
                  onChange={(e) => {
                    setPayment((prev) => ({
                      ...prev,
                      bills: {
                        ...prev.bills,
                        500:
                          e.target.value === ""
                            ? 0
                            : parseInt(e.target.value, 10),
                      },
                    }));
                  }}
                />
              </div>
            </div>
          </div>
          <div className="payment-container">
            <label>Pago con Monedas</label>
            <label>
              <b>{"Total Pagado con monedas: "}</b>
              {transformToCurrency(paymentState.totalCoins)}
            </label>
            <div className="payment-option-container">
              <div className="payment-option">
                <label>
                  <b>Monedas de 50c</b>
                </label>
                <input
                  type="number"
                  className="filter-input"
                  value={payment.coins["0.5"]}
                  min={0}
                  onChange={(e) => {
                    setPayment((prev) => ({
                      ...prev,
                      coins: {
                        ...prev.coins,
                        0.5:
                          e.target.value === "" ? 0 : parseInt(e.target.value),
                      },
                    }));
                  }}
                />
              </div>
              <div className="payment-option">
                <label>
                  <b>Monedas de 1</b>
                </label>
                <input
                  type="number"
                  className="filter-input"
                  value={payment.coins["1"]}
                  min={0}
                  onChange={(e) => {
                    setPayment((prev) => ({
                      ...prev,
                      coins: {
                        ...prev.coins,
                        1: e.target.value === "" ? 0 : parseInt(e.target.value),
                      },
                    }));
                  }}
                />
              </div>
              <div className="payment-option">
                <label>
                  <b>Monedas de 2</b>
                </label>
                <input
                  type="number"
                  className="filter-input"
                  value={payment.coins["2"]}
                  min={0}
                  onChange={(e) => {
                    setPayment((prev) => ({
                      ...prev,
                      coins: {
                        ...prev.coins,
                        2: e.target.value === "" ? 0 : parseInt(e.target.value),
                      },
                    }));
                  }}
                />
              </div>
              <div className="payment-option">
                <label>
                  <b>Monedas de 5</b>
                </label>

                <input
                  type="number"
                  className="filter-input"
                  value={payment.coins["5"]}
                  min={0}
                  onChange={(e) => {
                    setPayment((prev) => ({
                      ...prev,
                      coins: {
                        ...prev.coins,
                        5: e.target.value === "" ? 0 : parseInt(e.target.value),
                      },
                    }));
                  }}
                />
              </div>
              <div className="payment-option">
                <label>
                  <b>Monedas de 10</b>
                </label>

                <input
                  type="number"
                  className="filter-input"
                  value={payment.coins["10"]}
                  min={0}
                  onChange={(e) => {
                    setPayment((prev) => ({
                      ...prev,
                      coins: {
                        ...prev.coins,
                        10:
                          e.target.value === "" ? 0 : parseInt(e.target.value),
                      },
                    }));
                  }}
                />
              </div>
            </div>
          </div>
          <button
            className={cn("primary-button", { disable: !canSubmitPayment })}
            disabled={!canSubmitPayment}
            onClick={payTicketRequest}
          >
            Pagar
          </button>
        </div>
      )
    );
  };

  const ticketValidationLabel = () => ticketInfo?.hasValidation && (
    <div style={{display:"flex", flexDirection:"column"}}>
     <label htmlFor="" style={{color:"#0D734F", fontWeight:"bold"}}>Este ticket cuenta con validacion de establecimiento</label>
     <label htmlFor="" style={{color:"#0D734F", fontWeight:"bold"}}>{"Fecha/validation: " + transformDate(ticketInfo.validatedAt)}</label>
    </div>
  ) 
    
  const messageLabel = () => {
    if(!ticketInfo?.cocheDentro) return (
      <>
      <label htmlFor="">{`Este ticket ya ha salido, ${ticketInfo?.fechaSalida &&  "fecha/salida: " + transformDate(ticketInfo?.fechaSalida)}`}</label>
      </>
    )
    if (ticketInfo?.tolerancia) {
      return (
        <label>{`Ticket con tiempo de tolerancia para salir, tiempo:  ${ticketInfo?.tiempo_restante_tolerancia}`}</label>
      );
    }
    if (ticketInfo?.repago) {
      return <label>Ticket requiere nuevo pago</label>;
    }
    if (ticketInfo?.estado == "pagado" && !ticketInfo.repago) {
      return (
        <label>{`Ticket pagado  tiempo para salir:  ${ticketInfo?.tiempo_para_salir} min`}</label>
      );
    }
  };

  const payTicketInfoContainer = () => {
    return (
      shouldDisplayTicketInfo && (
        <div>
          {false ? (
            <label>No se encontró ticket</label>
          ) : (
            <div className="ticket-info">
              <label>
                <b>Información de ticket</b>
              </label>
              <div
                className={cn("ticket-info-container", {
                  hasToPay: ticketInfo?.repago,
                               })}

             
              >
                {messageLabel()}
                {ticketValidationLabel()}
                <div className="ticket-info-row">
                  <p className="info-content">
                    <b>{"Estado: "}</b>
                    <label>{ticketInfo?.estado}</label>
                  </p>
                  <p className="info-content">
                    <b>{"Fecha de entrada: "}</b>{" "}
                    <label>
                      {ticketInfo?.fechaEntrada &&
                        transformDate(ticketInfo?.fechaEntrada)}
                    </label>
                  </p>
                  <p className="info-content">
                    <b>{"Total de tiempo(hrs): "}</b>{" "}
                    <label> {ticketInfo?.total_time}</label>
                  </p>
                  <p className="info-content">
                    <b>{"Total a pagar:"}</b>{" "}
                    <label>
                      {
                          ticketInfo?.total_a_pagar && transformToCurrency(ticketInfo?.total_a_pagar)
                       }
                    </label>
                  </p>
                </div>
                { ticketInfo?.estado === "pagado" &&                <div className="ticket-payment-Info">
                  <label htmlFor="">Informacion de ultimo pago</label>
                  <p className="info-content"> 
                  <b>{"Tiempo transcurrido desde ultimo pago: "}</b>
                  <label htmlFor="">{ticketInfo?.tiempo_despues_de_utimo_pago}</label>
                  </p>
                  <b>Historial de pagos de ticket</b>
                  {ticketInfo?.dataPayment.map((item, index) => (
                    <div key={item.id} className="ticket-info-content">
                      <p className="info-content">
                        <b>{"No. de pago: "}</b>{" "}
                        <label> {index + 1}</label>
                      </p>
                      <p className="info-content">
                        <b>{"Fecha de pago: "}</b>{" "}
                        <label> {transformDate(item?.fechaPago)}</label>
                      </p>
                      <p className="info-content">
                        <b>{"Total pagado: "}</b>{" "}
                        <label> {transformToCurrency(item?.amount || 0)}</label>
                      </p>
                    </div>
                  ))}
                </div>}
              </div>
            </div>
          )}
        </div>
      )
    );
  };

  // useEffects

  useEffect(() => {
    const locationIdP = params.get("id");
    if (!locationIdP) return router.replace("/ticketPayment");
    setLocationId(locationIdP);
    getLocationInfo(locationIdP as string);
  }, []);

  useEffect(() => {
    totalPay();
  }, [payment]);

  useEffect(() => {
    if (!isLoading && !hasCredit && hasFetched) {
      router.replace("/ticketPayment");
    }
  }, [isLoading, hasCredit]);

  // ends useEffects

  return (
    <>
      <div className="main-content first">
        <div
          style={{
            position: "sticky",
            top: 0,
            background: "white",
            zIndex: 1,
            margin: 0,
            padding: 0,
          }}
        >
          <CreditInfoComponent />
        </div>
        {hasCredit && (
          <>
            <div className="header-container">
              <div className="options-header">
                <h1 className="main-header">Pago De ticket</h1>
                <a onClick={() => router.back()}>Regresar</a>
              </div>
              <b>Datos de ubicación</b>
              <div className="content-info">
                <label>
                  <b>{"Ubicación: "}</b>
                  {locationInfo?.title}
                </label>
                <label>
                  <b>{"Dirección: "}</b>
                  {locationInfo?.address}
                </label>
                <label>
                  <b>{"Contacto: "}</b>
                  {locationInfo?.contact}
                </label>
              </div>
            </div>

            <label>
              <b>Ingrese el código qr del ticket</b>
            </label>
            <div className="qr-input-container">
              <input
                type="text"
                placeholder="Ticket ID"
                className="filter-input"
                value={ticketId}
                onChange={(e) => {
                  const formattedValue = e.target.value.replace(/'/g, "-");
                  setTicketId(formattedValue);
                }}
              />
              <div
                className="trash-icon-container"
                onClick={() => setTicketId("")}
              >
                <TrashIcon />
              </div>
              <button onClick={getTicketInfo} className="primary-button">
                Buscar
              </button>
            </div>
            {payTicketInfoContainer()}
            {payTicketActions()}
          </>
        )}
      </div>
    </>
  );
}
