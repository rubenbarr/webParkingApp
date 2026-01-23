"use client";
import "../payticket.scss";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getMyLocations } from "@/api/locationApi";
import { Response } from "@/api/usersApi";

import CreditInfo from "@/components/CreditInfo/CreditInfo";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { ITicket } from "@/types/ticket";



export default function PayTicketPage() {
  const { setLoadingGlobal, token, handleToast } = useAuth();
  const { hasCredit } = useSelector((state: RootState) => state.creditInfo);

  const router = useRouter();
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [canloadMore, setCanLoadmore] = useState<boolean>(true);
  const [mypayments, setMyPayments] = useState<ITicket[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  async function getTicketsPayed(page: number, isDeleted: boolean = false) {
    setLoadingGlobal(true);
    const req = (await getMyLocations(
      token as string,
      page,
      limit,
    )) as Response;
    if (req) {
      setLoadingGlobal(false);
      if (req.state) {
        const data = req.data as [];
        if (data.length === 0) {
          if (isDeleted) {
            setMyPayments([]);
          }
          return setCanLoadmore(false);
        }
        if (mypayments?.length === 0) {
          return setMyPayments(data);
        }
        if (page === 1 && mypayments?.length !== 0) {
          return setMyPayments(data);
        } else {
          return setMyPayments((prev) => [...prev, ...data]);
        }
      } else {
        handleToast(
          "error",
          `Hubo un error buscando los pagos realizados, error: ${req.message}`,
        );
      }
    }
  }
  async function loadMoreLocations() {
    const nextPage = page + 1;
    setPage(nextPage);
    await getTicketsPayed(nextPage);
  }

  async function handleRefreshFunctions() {
    await Promise.all([getTicketsPayed(page)]).then(() =>
      setLoadingData(false),
    );
  }

  useEffect(() => {
    handleRefreshFunctions();
  }, []);

  const myPaymentsList = () => {
    return (
      <>
        <div className="header-container">
          <h1 className="main-header">Lista de pagos realizados</h1>
          <label>
            Esta lista corresponde a los tickets que realizó con su ultimo
            crédito
          </label>
        </div>
        <button className="primary-button">Refrescar</button>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="">item</th>
                <th className="">Puerta/Entrada</th>
                <th className="">Fecha/Entrada</th>
                <th className="">Fecha/Pago</th>
                <th className="">Monto Total</th>
                <th className="">TotalPagado</th>
                <th className="">Informacion de pago </th>
              </tr>
            </thead>
            <tbody>
              {loadingData ? (
                <tr>
                  <td colSpan={5}>Cargando datos...</td>{" "}
                </tr>
              ) : mypayments?.length === 0 ? (
                <tr>
                  <td colSpan={5}>Sin datos</td>
                </tr>
              ) : (
                mypayments?.map((item, index) => (
                  <tr
                    key={index}
                  >
                    <td>{(index += 1)}</td>
                    <td>{item.gate}</td>
                    <td>{item.fechaEntrada}</td>
                    <td>{item.fecha_pago}</td>
                    <td>{item.montoPagado}</td>
                    <td>{item.totalPayed}</td>
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
        <div className="options-header">
          <a
            className="content-action"
            onClick={() => router.push("/ticketPayment/creditReturn")}
          >
            Regreso de credito
          </a>
        </div>
        <CreditInfo />
        {myPaymentsList()}
      </div>
    </>
  );
}
