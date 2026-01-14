/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import cn from "classnames";
import {
  addCreditRequest,
  cancelCreditRequest,
  getCreditById,
  getCreditsPaginated,
  getOperatorsReqPaginated,
} from "@/api/credits";
import { Response } from "@/api/usersApi";
import { transformToCurrency } from "@/assets/utils";
import { UserTemplate } from "@/types/user";
import "./creditsStyle.scss";

interface CreditList {
  createdAt: string;
  createdBy: string;
  current_amount: number | null;
  finalAmount: number | null;
  initial_amount: number | null | string;
  creditCharged: number | null;
  operator: string;
  requestId: string;
  status: string;
  updatedAt: string;
  userId: string;
}

interface IOperator {
  userId: string;
  fullname: string;
}

interface IClosedCredit {
  finalAmount: string | number;
  closed_date: string;
  receptor: string;
  status: string;
  comment: string;
}

export default function Page() {
  const initialCreditInfo = {
    createdAt: "",
    createdBy: "",
    current_amount: null,
    finalAmount: null,
    initial_amount: null,
    operator: "",
    requestId: "",
    status: "",
    updatedAt: "",
    userId: "",
    creditCharged: null,
  };

  const initialCredicCloseInfo = {
    finalAmount: "",
    closed_date: "",
    receptor: "",
    status: "incompleto",
    comment: "",
  };
  const { userType, token, handleToast, setLoadingGlobal } = useAuth();
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const searchParams = useSearchParams();

  const [canLoadMore, setCanLoadMore] = useState(false);
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [creditList, setCreditList] = useState<CreditList[]>([]);
  const [creditInfo, setCreditInfo] = useState<CreditList>(initialCreditInfo);
  const [creditsPage, setCreditsPage] = useState(1);
  const [creditsLimit, setCreditsLimit] = useState(10);
  const [shouldDisplayCreditInfo, setShouldDisplayCreditInfo] = useState({
    timer: false,
    inPlace: false,
  });
  const [isEdit, setIsEdit] = useState(false);
  const [operators, setOperators] = useState<IOperator[]>([]);
  const [operatorsFiltered, setOperatorsFiltered] = useState<IOperator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState("");
  const [shouldDisplayOperators, setShouldDisplayOperators] = useState(false);
  const [canSubmitCredit, setCanSubmitCredit] = useState(false);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [canLoadMoreOperators, setCanLoadMoreOperators] = useState(true);
  const [validOperator, setValidOperator] = useState(false);
  const [operatorsPage, setOperatorsPage] = useState(1);
  const [operatorslimit, setOperatorsLimit] = useState(30);
  const [showModal, setShowModal] = useState(false);
  const inputOperatorsRef = useRef(false);
  const [cancelationComment, setCancelationComment] = useState<string | null>(
    null
  );
  const [closeCreditInfo, setCloseCreditInfo] = useState<IClosedCredit>(
    initialCredicCloseInfo
  );
  const [canSubmitCreditClose, setCanSubmitCreditClose] = useState(false);
  const [shoudDisplayWarningTextAmount, setShoudDisplayWarningTextAmount] = useState(false)
  const [amountWarningText, setAmountWarningText] = useState("")

  const handleRouter = (id: string) => {
    return router.push(`/credits?requestId=${id}`);
  };
  async function getCredits(page: number, limit: number) {
    const req = (await getCreditsPaginated(
      page,
      limit,
      token as string
    )) as Response;
    if (req.state) {
      const data = req.data as CreditList[];
      setCreditList(data);
    } else {
      handleToast("error", "Hubo un error obteniendo creditos");
    }
  }
  async function getCreditInfo(creditId: string) {
    try {
      setLoadingGlobal(true);
      const req = (await getCreditById(creditId, token as string)) as Response;
      console.log(req);
      if (req.state) {
        const data = req.data as CreditList[];
        setCreditInfo(data[0]);
        setIsEdit(true);
        handleShouldDisplayCreditInfo("show", true);
      } else {
        setIsEdit(false);
        handleShouldDisplayCreditInfo("hide", false);
        router.replace("/credits");
      }
    } catch (error) {
      setIsEdit(false);
      handleShouldDisplayCreditInfo("hide", false);
      router.replace("/credits");
    } finally {
      setLoadingGlobal(false);
    }
  }
  async function getOperators(page: number, limit: number) {
    const req = (await getOperatorsReqPaginated(
      page,
      limit,
      token as string
    )) as Response;
    if (req.state) {
      const data = req.data as UserTemplate[];
      if (data.length !== 0) {
        if (page === 1) {
          setOperators(data as any);
          setOperatorsFiltered(data as any);
        } else {
          setOperators((prev) => [...prev, ...(data as any)]);
          setOperatorsFiltered((prev) => [...prev, ...(data as any)]);
        }
      } else {
        setCanLoadMoreOperators(false);
      }
    } else {
      handleToast("error", "Hubo un error obteniendo creditos");
    }
  }

  async function addCredit() {
    if (!canSubmitCredit) return;
    setLoadingGlobal(true);
    const currentAmount = creditInfo.initial_amount as string;
    const newData = {
      userId: creditInfo.userId,
      amount: parseFloat(currentAmount.replace("$", "").replace(",", "")),
    };
    const req = (await addCreditRequest(token as string, newData)) as Response;
    setLoadingGlobal(false);
    if (req.state) {
      setCreditInfo(initialCreditInfo);
      handleShouldDisplayCreditInfo("hide", false);
      await getCredits(1, creditsLimit);
      handleToast("success", "Credito asignado correctamente");
    } else {
      handleToast(
        "error",
        req.message ||
          "Hubo un error, intente más tarde o comunique con administración"
      );
    }
  }

  async function refreshPage() {
    try {
      setLoadingGlobal(true);
      await getCredits(creditsPage, creditsLimit);
    } catch (error) {
    } finally {
      setLoadingGlobal(false);
    }
  }

  async function cancelCredit() {
    if (creditInfo.status !== "disponible") return;
    setLoadingGlobal(true);
    const req = (await cancelCreditRequest(
      token as string,
      { comentario: cancelationComment },
      creditInfo.requestId
    )) as Response;
    if (req.state) {
      setShowModal(false);
      handleToast("success", req.message ?? "Credito cancelado correctamente");
      setCancelationComment(null);
      setIsEdit(false);
      setCreditInfo(initialCreditInfo);
      handleShouldDisplayCreditInfo("hide", false);
      getCredits(creditsPage, creditsLimit);
    } else {
      handleToast(
        "error",
        req.message ??
          "Hubo un error, intente más tarde o comuniquese con administración"
      );
    }
    setLoadingGlobal(false);
  }

  const handleLoadMore = async () => {
    setShouldDisplayOperators(true);
    const nextPage = operatorsPage + 1;
    setOperatorsPage(nextPage);
    setLoadingOperators(true);
    await getOperators(nextPage, operatorslimit);
    setLoadingOperators(false);
  };

  const handleFilteredOperators = (val: string) => {
    setValidOperator(val === selectedOperator);
    setCreditInfo((prev) => ({ ...prev, operator: val }));
    setOperatorsFiltered(
      operators.filter((i) =>
        i.fullname.toLocaleLowerCase().includes(val.toLocaleLowerCase())
      )
    );
    if (val === "") setOperatorsFiltered(operators);
  };

  const handleCreditAmountInput = (val: string) => {
    if (isNaN(val as any)) return;
    setCreditInfo((prev) => ({ ...prev, initial_amount: val }));
  };

  function transformToCurrencyFunc() {
    const currentAmount = transformToCurrency(
      creditInfo.initial_amount as number
    );
    setCreditInfo((prev) => ({ ...prev, initial_amount: currentAmount }));
  }

  function transformBackCurrency() {
    const initial = creditInfo.initial_amount as string;
    if (initial === "" || !initial) return;
    const transform = initial.replace("$", "").replace(",", "");
    setCreditInfo((prev) => ({ ...prev, initial_amount: transform }));
  }

  const handleFinalAmountToDeliver = () => {
    const deliverAmount = closeCreditInfo?.finalAmount
      ? parseFloat(closeCreditInfo?.finalAmount as string)
      : 0;
    const finalAmount = creditInfo?.finalAmount;
    const sfinalAmount = new String(finalAmount)
      .replace("$", "")
      .replace(",", "");
      if (deliverAmount > parseFloat(sfinalAmount)){
        setAmountWarningText('La cantidad recibida es mayor');
      }  else if(deliverAmount < parseFloat(sfinalAmount)) {
        setAmountWarningText('La cantidad recibida es menor');
      }
      if(closeCreditInfo?.finalAmount === "") return (setShoudDisplayWarningTextAmount(false));
      setShoudDisplayWarningTextAmount(deliverAmount > parseFloat(sfinalAmount) || deliverAmount < parseFloat(sfinalAmount))
  };

  useEffect(() => {
    handleFinalAmountToDeliver()
  },[closeCreditInfo?.finalAmount])

  const handleShouldDisplayCreditInfo = (caseType: string, state: boolean) => {
    switch (caseType) {
      case "show":
        setShouldDisplayCreditInfo((prev) => ({ ...prev, timer: state }));
        setTimeout(() => {
          setShouldDisplayCreditInfo((prev) => ({ ...prev, inPlace: state }));
        }, 100);
        break;

      case "hide":
        setShouldDisplayCreditInfo((prev) => ({ ...prev, inPlace: state }));
        setTimeout(() => {
          setShouldDisplayCreditInfo((prev) => ({ ...prev, timer: state }));
        }, 100);
        break;
      default:
        break;
    }
  };

  async function handleRequests() {
    const [creditsr, operatorsr] = await Promise.all([
      getCredits(1, creditsLimit),
      getOperators(operatorsPage, operatorslimit),
    ]);
  }
  // useEffect events

  useEffect(() => {
    if (!userType || userType !== "global-admin") router.replace("/dashboard");
  }, [userType, router]);

  useEffect(() => {
    // getCredits();
    // getOperators(operatorsPage, operatorslimit);
    handleRequests();
    const requestId = searchParams.get("requestId");
    if (requestId) {
      getCreditInfo(requestId);
    } else {
      setIsEdit(false);
      handleShouldDisplayCreditInfo("hide", false);
    }
  }, []);

  useEffect(() => {
    setCanSubmitCredit(
      validOperator &&
        creditInfo.operator !== "" &&
        creditInfo.initial_amount !== "" &&
        creditInfo.initial_amount !== "$0.00" &&
        creditInfo.initial_amount !== "0.00"
    );
  }, [creditInfo]);

  // rendering components

  const deleteCreditRequestModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-body">
        <div className="modal-container">
          <h1>Cancelación de crédito</h1>
          <div className="content">
            <p>
              ¿Deséa cancelar crédito? coloque la justificación de la
              cancelación
            </p>
            <input
              placeholder="Justificación de cancelación"
              className="main-input white"
              value={cancelationComment ?? ""}
              onChange={(e) => setCancelationComment(e.target.value)}
            />
          </div>

          <div className="actions-modal-buttons">
            <button
              className="primary-button"
              onClick={() => setShowModal(false)}
            >
              Salir
            </button>
            <button
              className="primary-button"
              onClick={() => cancelCredit()}
              disabled={!cancelationComment}
            >
              Cancelar credito
            </button>
          </div>
        </div>
      </div>
    );
  };

  const selectContainer = () => {
    if (!shouldDisplayOperators || isEdit) return null;
    return (
      <div
        className={cn("select-container", {
          "no-item": operatorsFiltered && operatorsFiltered.length === 0,
        })}
      >
        {" "}
        {loadingOperators && (
          <div className="loading-operators-icon">cargando...</div>
        )}
        {operatorsFiltered && operatorsFiltered.length > 0 ? (
          <>
            {operatorsFiltered.map((i) => (
              <div
                className={cn("select-item", {
                  selected: i.fullname === creditInfo.operator,
                })}
                key={i.userId}
                onClick={() => {
                  setValidOperator(true);
                  setSelectedOperator(i.fullname);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();

                  setCreditInfo((prev) => ({
                    ...prev,
                    operator: i.fullname,
                    userId: i.userId as any,
                  }));
                }}
              >
                <label className="item">{i.fullname}</label>
              </div>
            ))}
            {canLoadMoreOperators && (
              <div
                className={cn("select-item")}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleLoadMore();
                }}
              >
                <label className="item">cargar más</label>
              </div>
            )}
          </>
        ) : (
          <div className="select-item">
            <label>sin elementos</label>
          </div>
        )}
      </div>
    );
  };
  const creditContainerInfo = () => {
    if (!shouldDisplayCreditInfo.timer) return null;
    return (
      <div
        className={cn("credit-container", {
          inPlace: shouldDisplayCreditInfo.inPlace,
        })}
      >
        <div className="buttons-container">
          <button
            className="primary-button secondary"
            onClick={() => {
              handleShouldDisplayCreditInfo("hide", false);
              setCreditInfo(initialCreditInfo);
              setIsEdit(false);
            }}
          >
            Cancelar
          </button>
          {isEdit ? (
            <button
              className={cn("primary-button", {
                disable: creditInfo?.status !== "disponible",
              })}
              disabled={creditInfo?.status !== "disponible"}
              onClick={() => setShowModal(true)}
            >
              Cancelar
            </button>
          ) : (
            <button
              className={cn("primary-button", { disable: !canSubmitCredit })}
              disabled={!canSubmitCredit}
              onClick={addCredit}
            >
              Guardar
            </button>
          )}
        </div>
        <div className="credit-info-header">
          <h2>Información de credito</h2>
          <label>{isEdit ? "Crédito asignado" : "Nuevo Crédito"}</label>
        </div>
        <div className="main-content-credit">
          <div className="content-info">
            <label>Operador</label>
            <input
              placeholder="seleccionar operador"
              className="main-input white"
              type="text"
              value={creditInfo.operator}
              onChange={(e) => handleFilteredOperators(e.target.value)}
              onFocus={() => setShouldDisplayOperators(true)}
              onBlur={() => {
                if (!inputOperatorsRef.current) {
                  setShouldDisplayOperators(false);
                }
                inputOperatorsRef.current = false;
              }}
              disabled={isEdit}
            />
            {selectContainer()}
          </div>
          <div className="content-info">
            <label>$ Crédito Asignado</label>
            <input
              disabled={isEdit}
              placeholder="$ cantidad de crédito"
              type="text"
              className="main-input white"
              value={creditInfo.initial_amount ?? ""}
              onChange={(e) => handleCreditAmountInput(e.target.value)}
              onBlur={() => transformToCurrencyFunc()}
              onFocus={() => transformBackCurrency()}
            />
          </div>
        </div>
        {isEdit && (
          <>
            <div className="main-content-credit secondary">
              <div className="content-info">
                <label>Crédito Actual</label>
                <input
                  placeholder=""
                  className="main-input white"
                  type="text"
                  disabled
                  value={
                    creditInfo?.current_amount
                      ? transformToCurrency(creditInfo?.current_amount)
                      : ""
                  }
                />
              </div>
              <div className="content-info">
                <label>Crédito Final</label>
                <input
                  placeholder=""
                  className="main-input white"
                  type="text"
                  disabled
                  value={
                    creditInfo?.finalAmount
                      ? transformToCurrency(creditInfo?.finalAmount)
                      : ""
                  }
                />
              </div>
              <div className="content-info">
                <label>Total Cobrado</label>
                <input
                  placeholder=""
                  className="main-input white"
                  type="text"
                  disabled
                  value={
                    creditInfo?.creditCharged
                      ? transformToCurrency(creditInfo.creditCharged as any)
                      : ""
                  }
                />
              </div>
              <div className="content-info">
                <label>Estatus</label>
                <input
                  placeholder=""
                  className="main-input white"
                  type="text"
                  disabled
                  value={creditInfo?.status}
                />
              </div>
              <div className="content-info">
                <label>Creado Por</label>
                <input
                  placeholder=""
                  className="main-input white"
                  type="text"
                  disabled
                  value={creditInfo?.createdBy}
                />
              </div>
              <div className="content-info">
                <label>Fecha de creación</label>
                <input
                  placeholder=""
                  type="text"
                  className="main-input white"
                  disabled
                  value={creditInfo?.createdAt}
                />
              </div>
            </div>
            <div className="credit-options-container">
              <div className="options-header">
                <label>
                  {" "}
                  <b>Cierre de credíto</b>
                </label>
              </div>
              <div className="content">
                <div className="content-info">
                  <label>Cantidad Entregada</label>
                  <input
                    className="main-input white"
                    placeholder="$ Cantidad"
                    disabled={
                      creditInfo.status === "disponible" ||
                      creditInfo.status === "cancelado"
                    }
                    type="text"
                    value={closeCreditInfo.finalAmount}
                    onChange={(e) =>  {
                      if( !isNaN(e.target?.value as any)) {
                        setCloseCreditInfo(prev => ({...prev, finalAmount:e.target.value}))
                      }
                    }
                    }
                  />
                  {shoudDisplayWarningTextAmount && (
                    <label className="informative-input-label">
                      {amountWarningText}
                    </label>
                  )}
                </div>
                <div className="content-info">
                  <label>Fecha de retiro/cierre</label>
                  <input
                    className="main-input white"
                    type="date"
                    disabled={
                      creditInfo.status === "disponible" ||
                      creditInfo.status === "cancelado"
                    }
                    value={closeCreditInfo.closed_date}
                    onChange={(e) =>
                      setCloseCreditInfo((prev) => ({
                        ...prev,
                        closed_date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="content-info">
                  <label>Entrega</label>
                  <input
                    className="main-input white"
                    type="text"
                    disabled={
                      creditInfo.status === "disponible" ||
                      creditInfo.status === "cancelado"
                    }
                    value={closeCreditInfo.receptor}
                    placeholder="Persona que entrega"
                    onChange={(e) =>
                      setCloseCreditInfo((prev) => ({
                        ...prev,
                        receptor: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="content-info">
                  <label>Comentarios</label>
                  <input
                    className="main-input white"
                    type="text"
                    disabled={
                      creditInfo.status === "disponible" ||
                      creditInfo.status === "cancelado"
                    }
                    value={closeCreditInfo.receptor}
                    onChange={(e) =>
                      setCloseCreditInfo((prev) => ({
                        ...prev,
                        receptor: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <button
                className="primary-button"
                disabled={
                  creditInfo.status === "disponible" ||
                  creditInfo.status === "cancelado" ||
                  !canSubmitCreditClose
                }
              >
                Cerrar crédito
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  if (!userType || userType !== "global-admin") return null;
  else {
    return (
      <div className="main-content">
        {deleteCreditRequestModal()}
        <div className="main-header">Manejo de créditos</div>
        <div className="primary-content dataSet">
          <div className="header-content with-options">
            <button
              className={cn("primary-button")}
              onClick={() => {
                handleShouldDisplayCreditInfo("show", true);
                setIsEdit(false);
                setCreditInfo(initialCreditInfo);
              }}
            >
              Generar nuevo crédito
            </button>
            <button onClick={refreshPage} className="primary-button reset">
              Refrescar datos
            </button>
          </div>
          {creditContainerInfo()}
          <div className="content-row">
            <label>Buscar por fecha</label>
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
              <button className="primary-button" onClick={() => {}}>
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
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="">Item</th>
                  <th className="">Fecha/Creación</th>
                  <th className="">$ Inicial</th>
                  <th className="">$ Restante</th>
                  <th className="">$ final</th>
                  <th className="">Operador</th>
                  <th className="">estatus</th>
                  <th className="">Creado Por</th>
                </tr>
              </thead>
              <tbody>
                {creditList.length > 0 ? (
                  creditList.map((item: CreditList, index: number) => (
                    <tr
                      key={item.requestId}
                      className=""
                      onClick={() => {
                        handleRouter(item.requestId);
                        getCreditInfo(item.requestId);
                        // setIsEdit(true);
                        // setCreditInfo({
                        //   ...item,
                        //   initial_amount: transformToCurrency(
                        //     item.initial_amount as number
                        //   ),
                        // });
                        // handleShouldDisplayCreditInfo("show", true);
                      }}
                    >
                      <td>{(index = index + 1)}</td>
                      <td className="">{item.createdAt}</td>
                      <td className="">
                        {transformToCurrency(item.initial_amount as number)}{" "}
                      </td>
                      <td className="">
                        {transformToCurrency(item.current_amount as number)}
                      </td>
                      <td className="">
                        {item.finalAmount
                          ? transformToCurrency(item?.finalAmount as number)
                          : ""}
                      </td>
                      <td className="">{item.operator}</td>
                      <td className="">{item.status}</td>
                      <td className="">{item.createdBy}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="">
                      Sin datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className={"load-more-container"}>
            {canLoadMore ? (
              <button className={"load-more-button"} onClick={() => {}}>
                Cargar mas
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
