"use client"
import { getTicketsPayedByCredit } from '@/api/ticketsApi';
import { Response } from '@/api/usersApi';
import { transformToCurrency } from '@/assets/utils';
import CreditInfoComponent from '@/components/CreditInfo/CreditInfo'
import { useAuth } from '@/context/AuthContext';
import { IDataPayment, IPayment, ITicket } from '@/types/ticket';
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();

  const  {setLoadingGlobal, isLoadingGlobal, token, handleToast } = useAuth();

  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [canloadMore, setCanLoadmore] = useState<boolean>(true);
  const [mypayments, setMyPayments] = useState<ITicket[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [creditId, setCreditId] = useState<string | null>( )
  
  const getDate = (date: string) => {
    return new Date(date).toLocaleString()
    return date;
  };
    async function getTicketsPayed(page: number, credit: string) {
      setLoadingGlobal(true);
      const req = (await getTicketsPayedByCredit(
        token as string,
        page,
        limit,
        credit
      )) as Response;
      if (req) {
        setLoadingGlobal(false);
        if (req.state) {
          const data = req.data as [];
          if (data.length === 0) {
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
    await getTicketsPayed(nextPage, creditId as string);
  }

  useEffect(() => {
    const id = params.get("id")
    if (!id) return router.replace("/ticketPayment")
    setCreditId(id)
    getTicketsPayed(page, id as string)
  },[])

  const renderPaymentData = (data: IPayment) => {
      if (!data) return null;
      return (
        <td>
          <table>
            <thead>
  
              <tr>
                <th className="data" colSpan={5}>Billetes</th>
                <th className="data" colSpan={4}>Monedas</th>
              </tr>
            </thead>
            <tbody>
              <tr className="data">
                <th> {"$20"}</th>
                <th> {"$50"}</th>
                <th> {"$100"}</th>
                <th> {"$200"}</th>
                <th> {"$500"}</th>
                <th> {"$0.5"}</th>
                <th> {"$1"}</th>
                <th> {"$2"}</th>
                <th> {"$5"}</th>
                <th> {"$10"}</th>
              </tr>
              <tr className="data">
                <td> {data.bills[20]}</td>
                <td> {data.bills[50]}</td>
                <td> {data.bills[100]}</td>
                <td> {data.bills[200]}</td>
                <td> {data.bills[500]}</td>
                <td> {data.coins[0.5]}</td>
                <td> {data.coins[1]}</td>
                <td> {data.coins[2]}</td>
                <td> {data.coins[5]}</td>
                <td> {data.coins[10]}</td>
              </tr>
            </tbody>
          </table>
        </td>
      );
    };

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
          <button className="primary-button" onClick={()=> getTicketsPayed(1, creditId as string)}>Refrescar</button>
  
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="">item</th>
                  <th className="">Puerta/Entrada</th>
                  <th className="">Fecha/Entrada</th>
                  <th className="">Fecha/Pago</th>
                  <th className="">TotalPagado</th>
                  <th className="">Total de cobros</th>
                  <th>Coche dentro</th>
                  <th>Fecha de salida</th>
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
                  mypayments?.map((item, index) => {
                    const dataPayment = item?.dataPayment || [] as IDataPayment[];
                    const lastItem = dataPayment.length === 0 ? null : dataPayment[dataPayment.length -1];
                    const fechaPago = lastItem ? getDate(lastItem.fechaPago) : ""
                    const montoTotalPagado = lastItem ? dataPayment.reduce((acc, currentVal ) => acc += currentVal.amount, 0) : 0
                    return (
                    <tr key={index}>
                      <td>{(index += 1)}</td>
                      <td>{item.gateLabel}</td>
                      <td>
                        {item.fechaEntrada ? getDate(item.fechaEntrada) : ""}
                      </td>
                      <td>{fechaPago }</td>
                      <td>
                         {transformToCurrency(montoTotalPagado)}
                      </td>
                      <td>{dataPayment.length}</td>
                      <td>{item.cocheDentro ? "Si" : "No"}</td>
                      <td>{item?.fechaSalida || ""}</td>
                    </tr>
                  )
                  })
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
  <div className="main-content">
    <div className="options-header">
      <a
        className="content-action"
        onClick={() => router.push("/ticketPayment")}
      >
        Regresar
      </a>
    </div>
    {myPaymentsList()}
  </div>
  )
}
